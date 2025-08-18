import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Phone, 
  Star, 
  Download, 
  Filter,
  Calendar,
  CheckCircle,
  Plus,
  Edit,
  Trash
} from "lucide-react";
import { useReports, useUsers, useSchedules } from "@/hooks/useFirestore";
import { Report, User, Schedule } from "@/services/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Helper functions for calculations
const calculateAverageWaitTime = (reports: Report[]): string => {
  if (reports.length === 0) return "0:00";
  
  const totalWaitTime = reports.reduce((total, report) => {
    const waitTime = report.data?.waitTime || 0;
    return total + waitTime;
  }, 0);
  
  const avgMinutes = Math.round(totalWaitTime / reports.length);
  const minutes = avgMinutes % 60;
  const hours = Math.floor(avgMinutes / 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const calculateAverageSatisfaction = (reports: Report[]): number => {
  if (reports.length === 0) return 0;
  
  const totalSatisfaction = reports.reduce((total, report) => {
    const satisfaction = report.data?.satisfaction || 0;
    return total + satisfaction;
  }, 0);
  
  return Math.round((totalSatisfaction / reports.length) * 10) / 10;
};

const calculateUserAverageTime = (userReports: Report[]): string => {
  if (userReports.length === 0) return "0:00";
  
  const totalTime = userReports.reduce((total, report) => {
    const callTime = report.data?.callDuration || 0;
    return total + callTime;
  }, 0);
  
  const avgMinutes = Math.round(totalTime / userReports.length);
  const minutes = avgMinutes % 60;
  const hours = Math.floor(avgMinutes / 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const calculateUserSatisfaction = (userReports: Report[]): number => {
  if (userReports.length === 0) return 0;
  
  const totalSatisfaction = userReports.reduce((total, report) => {
    const satisfaction = report.data?.satisfaction || 0;
    return total + satisfaction;
  }, 0);
  
  return Math.round((totalSatisfaction / userReports.length) * 10) / 10;
};

const calculateUserTrend = (userReports: Report[], userSchedules: Schedule[]): 'up' | 'down' | 'stable' => {
  if (userReports.length < 2) return 'stable';
  
  // Compare recent performance with older performance
  const recentReports = userReports.slice(-5); // Last 5 reports
  const olderReports = userReports.slice(-10, -5); // Reports 6-10 from end
  
  if (recentReports.length === 0 || olderReports.length === 0) return 'stable';
  
  const recentAvg = recentReports.reduce((sum, report) => sum + (report.data?.satisfaction || 0), 0) / recentReports.length;
  const olderAvg = olderReports.reduce((sum, report) => sum + (report.data?.satisfaction || 0), 0) / olderReports.length;
  
  if (recentAvg > olderAvg + 0.5) return 'up';
  if (recentAvg < olderAvg - 0.5) return 'down';
  return 'stable';
};

interface ReportsManagementProps {
  onBack: () => void;
}

const ReportsManagement = ({ onBack }: ReportsManagementProps) => {
  const [selectedReportType, setSelectedReportType] = useState<string>("all");
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [showEditReportDialog, setShowEditReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    type: "performance" as 'performance' | 'attendance' | 'communication' | 'general',
    data: {}
  });
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { data: reports, loading: reportsLoading, error: reportsError, add, update, remove } = useReports();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();
  const { data: schedules, loading: schedulesLoading, error: schedulesError } = useSchedules();
  
  // Calculate daily stats from real data
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  // Get today's schedules to calculate staff on duty
  const todaySchedules = schedules.filter((schedule: Schedule) => {
    const scheduleDate = schedule.date?.toDate();
    return scheduleDate && scheduleDate >= todayStart && scheduleDate <= todayEnd && schedule.status === 'confirmed';
  });
  
  // Calculate staff on duty from confirmed schedules
  const staffOnDuty = new Set(todaySchedules.map(schedule => schedule.userId)).size;
  
  // Calculate total calls from reports created today
  const todayReports = reports.filter((report: Report) => {
    const reportDate = report.createdAt?.toDate();
    return reportDate && reportDate >= todayStart && reportDate <= todayEnd;
  });
  
  const dailyStats = {
    totalCalls: todayReports.length,
    avgWaitTime: calculateAverageWaitTime(todayReports),
    satisfaction: calculateAverageSatisfaction(todayReports),
    staffOnDuty: staffOnDuty,
    resolvedCalls: todayReports.filter((report: Report) => report.data?.status === 'resolved').length,
    missedCalls: todayReports.filter((report: Report) => report.data?.status === 'missed').length
  };

  // Calculate performance data from users with real metrics
  const performanceData = users
    .filter((user: User) => user.role === 'employee')
    .map((user: User) => {
      const userReports = reports.filter((report: Report) => report.data?.userId === user.id);
      const userSchedules = schedules.filter((schedule: Schedule) => schedule.userId === user.id);
      
      return {
        name: user.name || 'Unknown',
        calls: userReports.length,
        avgTime: calculateUserAverageTime(userReports),
        satisfaction: calculateUserSatisfaction(userReports),
        trend: calculateUserTrend(userReports, userSchedules)
      };
    })
    .sort((a, b) => b.calls - a.calls); // Sort by performance

  const weeklyTrends = [
    { day: "א'", calls: 1156, satisfaction: 4.1 },
    { day: "ב'", calls: 1289, satisfaction: 4.3 },
    { day: "ג'", calls: 1345, satisfaction: 4.2 },
    { day: "ד'", calls: 1198, satisfaction: 4.4 },
    { day: "ה'", calls: 1247, satisfaction: 4.2 },
    { day: "ו'", calls: 892, satisfaction: 4.6 },
    { day: "ש'", calls: 567, satisfaction: 4.8 }
  ]; // TODO: Calculate from actual historical data

  // Filter reports based on selected type
  const filteredReports = selectedReportType === "all" 
    ? reports 
    : reports.filter((report: Report) => report.type === selectedReportType);

  // Validation functions
  const validateReportData = (report: typeof newReport): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!report.title.trim()) {
      errors.push("כותרת הדוח היא שדה חובה");
    } else if (report.title.trim().length < 3) {
      errors.push("כותרת הדוח חייבת להכיל לפחות 3 תווים");
    }

    if (!report.description.trim()) {
      errors.push("תיאור הדוח הוא שדה חובה");
    } else if (report.description.trim().length < 10) {
      errors.push("תיאור הדוח חייב להכיל לפחות 10 תווים");
    }

    if (!report.type) {
      errors.push("סוג הדוח הוא שדה חובה");
    }

    // Check for duplicate report titles
    const existingReport = reports.find((r: Report) => r.title === report.title);
    if (existingReport) {
      errors.push("כותרת דוח זו כבר קיימת במערכת");
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleAddReport = async () => {
    const validation = validateReportData(newReport);
    
    if (!validation.isValid) {
      toast({
        title: "שגיאה בנתונים",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      await add({
        title: newReport.title,
        description: newReport.description,
        type: newReport.type,
        data: newReport.data,
        createdBy: currentUser?.uid || 'unknown',
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      });

      toast({
        title: "דוח נוסף בהצלחה",
        description: `${newReport.title} נוסף למערכת`,
      });
      
      setNewReport({
        title: "",
        description: "",
        type: "performance",
        data: {}
      });
      setShowAddReportDialog(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת הדוח",
        variant: "destructive",
      });
    }
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setShowEditReportDialog(true);
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    try {
      await update(editingReport.id!, {
        title: editingReport.title,
        description: editingReport.description,
        type: editingReport.type,
        data: editingReport.data,
        updatedAt: new Date() as any
      });

      toast({
        title: "דוח עודכן בהצלחה",
        description: `${editingReport.title} עודכן במערכת`,
      });
      
      setShowEditReportDialog(false);
      setEditingReport(null);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הדוח",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק דוח זה?")) {
      return;
    }

    try {
      await remove(reportId);
      toast({
        title: "דוח נמחק בהצלחה",
        description: "הדוח נמחק מהמערכת",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הדוח",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = (report: Report) => {
    // TODO: Implement actual export functionality
    toast({
      title: "ייצוא דוח",
      description: `דוח ${report.title} יוצא...`,
    });
  };

  if (reportsLoading || usersLoading || schedulesLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתוני דוחות...</p>
        </div>
      </div>
    );
  }

  if (reportsError || usersError || schedulesError) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת נתונים</h3>
          <p className="text-gray-600">{reportsError?.message || usersError?.message || schedulesError?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <Button onClick={onBack} variant="outline">
          חזרה
        </Button>
      </div>

      {/* כותרת עיקרית */}
      <div className="mb-8">
        <div className="flex items-center space-x-reverse space-x-4 mb-2">
          <div className="bg-violet-600 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">דוחות וניתוחים</h2>
            <p className="text-lg text-gray-600">ביצועים, סטטיסטיקות ודוחות מפורטים</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">דוח יומי</TabsTrigger>
          <TabsTrigger value="performance">ביצועי עובדים</TabsTrigger>
          <TabsTrigger value="trends">מגמות</TabsTrigger>
          <TabsTrigger value="reports">דוחות</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">סה"כ שיחות היום</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">{dailyStats.totalCalls}</span>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">זמן המתנה ממוצע</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">{dailyStats.avgWaitTime}</span>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">שביעות רצון</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{dailyStats.satisfaction}/5</span>
                  <Star className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>שיחות שטופלו</CardTitle>
                <CardDescription>סטטיסטיקות שיחות יומיות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>שיחות שטופלו</span>
                    <Badge variant="default">{dailyStats.resolvedCalls}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>שיחות שלא נענו</span>
                    <Badge variant="destructive">{dailyStats.missedCalls}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>עובדים במשמרת</span>
                    <Badge variant="secondary">{dailyStats.staffOnDuty}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ביצועי עובדים</CardTitle>
                <CardDescription>העובדים המובילים היום</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.slice(0, 3).map((employee, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.calls} שיחות</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{employee.satisfaction}/5</p>
                        <p className="text-sm text-gray-600">שביעות רצון</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ביצועי עובדים מפורטים</CardTitle>
              <CardDescription>ניתוח ביצועים של כל עובד</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        {employee.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.calls} שיחות</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="text-center">
                        <p className="font-medium">{employee.avgTime}</p>
                        <p className="text-sm text-gray-600">זמן ממוצע</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{employee.satisfaction}/5</p>
                        <p className="text-sm text-gray-600">שביעות רצון</p>
                      </div>
                      <Badge variant={employee.trend === "up" ? "default" : "secondary"}>
                        {employee.trend === "up" ? "↑" : "↓"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>מגמות שבועיות</CardTitle>
              <CardDescription>ניתוח מגמות לאורך השבוע</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weeklyTrends.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <p className="font-semibold">{day.day}</p>
                    <div className="mt-2">
                      <p className="text-lg font-bold">{day.calls}</p>
                      <p className="text-xs text-gray-600">שיחות</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">{day.satisfaction}/5</p>
                      <p className="text-xs text-gray-600">שביעות רצון</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="סוג דוח" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הדוחות</SelectItem>
                  <SelectItem value="performance">ביצועים</SelectItem>
                  <SelectItem value="attendance">נוכחות</SelectItem>
                  <SelectItem value="communication">תקשורת</SelectItem>
                  <SelectItem value="general">כללי</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  צור דוח חדש
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>יצירת דוח חדש</DialogTitle>
                  <DialogDescription>צור דוח חדש עם נתונים מותאמים</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">כותרת הדוח</label>
                    <Input
                      value={newReport.title}
                      onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                      placeholder="הכנס כותרת דוח"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תיאור</label>
                    <Input
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      placeholder="תיאור הדוח"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">סוג דוח</label>
                    <Select value={newReport.type} onValueChange={(value: any) => setNewReport({...newReport, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג דוח" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">ביצועים</SelectItem>
                        <SelectItem value="attendance">נוכחות</SelectItem>
                        <SelectItem value="communication">תקשורת</SelectItem>
                        <SelectItem value="general">כללי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddReportDialog(false)}>
                      ביטול
                    </Button>
                    <Button onClick={handleAddReport}>
                      צור דוח
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report: Report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-muted-foreground">{report.description}</p>
                      <div className="flex items-center space-x-reverse space-x-4 mt-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="text-sm text-gray-600">
                          נוצר: {report.createdAt ? new Date(report.createdAt.toDate()).toLocaleDateString('he-IL') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-reverse space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditReport(report)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => report.id && handleDeleteReport(report.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Report Dialog */}
      <Dialog open={showEditReportDialog} onOpenChange={setShowEditReportDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת דוח</DialogTitle>
            <DialogDescription>עדכן פרטי הדוח</DialogDescription>
          </DialogHeader>
          {editingReport && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">כותרת הדוח</label>
                <Input
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({...editingReport, title: e.target.value})}
                  placeholder="הכנס כותרת דוח"
                />
              </div>
              <div>
                <label className="text-sm font-medium">תיאור</label>
                <Input
                  value={editingReport.description}
                  onChange={(e) => setEditingReport({...editingReport, description: e.target.value})}
                  placeholder="תיאור הדוח"
                />
              </div>
              <div>
                <label className="text-sm font-medium">סוג דוח</label>
                <Select value={editingReport.type} onValueChange={(value: any) => setEditingReport({...editingReport, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג דוח" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">ביצועים</SelectItem>
                    <SelectItem value="attendance">נוכחות</SelectItem>
                    <SelectItem value="communication">תקשורת</SelectItem>
                    <SelectItem value="general">כללי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditReportDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleUpdateReport}>
                  עדכן דוח
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;