import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  X, 
  AlertTriangle,
  ArrowRight,
  User as UserIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSchedules, useUsers, useShiftRequests, useShiftTemplates } from "@/hooks/useFirestore";
import { Schedule, User, ShiftRequest, ShiftTemplate } from "@/services/firestore";
import { Timestamp } from "firebase/firestore";

interface ScheduleManagementProps {
  onBack: () => void;
}

const ScheduleManagement = ({ onBack }: ScheduleManagementProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [showEditShiftDialog, setShowEditShiftDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const { data: templates, add: addTemplate, remove: deleteTemplate } = useShiftTemplates();
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    shiftType: 'morning' as 'morning' | 'afternoon' | 'night',
    startTime: '08:00',
    endTime: '16:00',
    notes: ""
  });
  const [newSchedule, setNewSchedule] = useState({
    userId: "",
    userName: "",
    date: new Date(),
    startTime: "08:00",
    endTime: "16:00",
    shiftType: "morning" as 'morning' | 'afternoon' | 'night',
    status: "scheduled" as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
    notes: ""
  });
  const { toast } = useToast();
  const { data: schedules, loading: schedulesLoading, error: schedulesError, add, update, remove } = useSchedules();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();
  const { data: requests, loading: requestsLoading, error: requestsError, update: updateRequest } = useShiftRequests('pending');
  
  // Helper function to get user role from users data
  const getUserRole = (userId: string): string => {
    const user = users.find((user: User) => user.id === userId);
    return user?.position || 'Employee';
  };

  // Helper function to calculate required staff based on shift type
  const calculateRequiredStaff = (shiftType: string): number => {
    // Calculate based on actual schedules for this shift type
    const shiftSchedules = schedules.filter((schedule: Schedule) => {
      const scheduleDate = schedule.date?.toDate();
      return schedule.shiftType === shiftType && 
             scheduleDate && 
             scheduleDate.toDateString() === selectedDate.toDateString();
    });
    
    // Return the number of actual schedules for this shift type
    // This represents the "required" staff based on what's actually scheduled
    return shiftSchedules.length;
  };

  // Helper function to detect shift conflicts
  const detectShiftConflicts = (userId: string, date: Date, startTime: string, endTime: string, excludeScheduleId?: string): Schedule[] => {
    const conflicts: Schedule[] = [];
    
    schedules.forEach((schedule: Schedule) => {
      if (schedule.id === excludeScheduleId) return; // Skip the schedule being edited
      
      const scheduleDate = schedule.date?.toDate();
      if (!scheduleDate) return;
      
      // Check if same user and same date
      if (schedule.userId === userId && scheduleDate.toDateString() === date.toDateString()) {
        // Check for time overlap
        const existingStart = new Date(`2000-01-01T${schedule.startTime}`);
        const existingEnd = new Date(`2000-01-01T${schedule.endTime}`);
        const newStart = new Date(`2000-01-01T${startTime}`);
        const newEnd = new Date(`2000-01-01T${endTime}`);
        
        if (newStart < existingEnd && newEnd > existingStart && schedule.status !== 'cancelled') {
          conflicts.push(schedule);
        }
      }
    });
    
    return conflicts;
  };

  // Convert Firestore schedules to schedule data format
  const scheduleData = schedules
    .filter((schedule: Schedule) => {
      const scheduleDate = schedule.date?.toDate();
      return scheduleDate && scheduleDate.toDateString() === selectedDate.toDateString();
    })
    .map((schedule: Schedule) => ({
      id: schedule.id || '',
      shift: schedule.shiftType === 'morning' ? 'בוקר' : schedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה',
      time: `${schedule.startTime}-${schedule.endTime}`,
      employees: [{
        name: schedule.userName || 'Unknown',
        role: getUserRole(schedule.userId),
        status: schedule.status === 'confirmed' ? 'confirmed' : schedule.status === 'scheduled' ? 'pending' : 'cancelled'
      }],
      required: 1, // Each schedule represents one required position
      filled: schedule.status === 'confirmed' ? 1 : 0,
      schedule: schedule // Keep reference to original schedule data
    }));

  // Group schedules by shift type for better display
  const groupedSchedules = scheduleData.reduce((acc: any, schedule: any) => {
    const shiftType = schedule.shift;
    if (!acc[shiftType]) {
      acc[shiftType] = {
        id: shiftType,
        shift: shiftType,
        time: schedule.time,
        employees: [],
        required: 0,
        filled: 0,
        schedules: []
      };
    }
    acc[shiftType].employees.push(...schedule.employees);
    acc[shiftType].required += 1; // Each schedule is one required position
    acc[shiftType].filled += schedule.filled;
    acc[shiftType].schedules.push(schedule.schedule);
    return acc;
  }, {});

  const scheduleDataArray = Object.values(groupedSchedules) as any[];

  // Get employees for dropdown
  const employees = users.filter((user: User) => user.role === 'employee' && user.isActive);

  // Generate weekly schedule data based on actual schedules
  const generateWeeklySchedule = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekDays = [];
    const hebrewDays = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      
      // Get schedules for this date
      const daySchedules = schedules.filter((schedule: Schedule) => {
        const scheduleDate = schedule.date?.toDate();
        return scheduleDate && scheduleDate.toDateString() === currentDate.toDateString();
      });
      
      // Calculate coverage based on confirmed vs total schedules
      const confirmedSchedules = daySchedules.filter((s: Schedule) => s.status === 'confirmed');
      const totalSchedules = daySchedules.length;
      const coverage = totalSchedules > 0 ? Math.round((confirmedSchedules.length / totalSchedules) * 100) : 0;
      
      weekDays.push({
        day: hebrewDays[i],
        date: currentDate.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        shifts: daySchedules.length,
        coverage: coverage,
        dateObj: currentDate
      });
    }
    
    return weekDays;
  };

  const weeklySchedule = generateWeeklySchedule();

  // Validation functions
  const validateScheduleData = (schedule: typeof newSchedule): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!schedule.userId || !schedule.userName) {
      errors.push("נא לבחור עובד");
    }

    if (!schedule.startTime || !schedule.endTime) {
      errors.push("שעות התחלה וסיום הן שדות חובה");
    } else {
      const startTime = new Date(`2000-01-01T${schedule.startTime}`);
      const endTime = new Date(`2000-01-01T${schedule.endTime}`);
      
      if (startTime >= endTime) {
        errors.push("שעת סיום חייבת להיות מאוחרת משעת התחלה");
      }
    }

    if (!schedule.date) {
      errors.push("תאריך הוא שדה חובה");
    } else {
      const scheduleDate = new Date(schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (scheduleDate < today) {
        errors.push("לא ניתן ליצור משמרת לתאריך בעבר");
      }
    }

    // Check for shift conflicts
    const conflicts = detectShiftConflicts(schedule.userId, schedule.date, schedule.startTime, schedule.endTime);
    if (conflicts.length > 0) {
      const conflictTimes = conflicts.map(c => `${c.startTime}-${c.endTime}`).join(', ');
      errors.push(`העובד כבר מוקצה למשמרות: ${conflictTimes}`);
    }

    return { isValid: errors.length === 0, errors };
  };

  // Handler functions
  const handleAddShift = async () => {
    const validation = validateScheduleData(newSchedule);
    
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
        userId: newSchedule.userId,
        userName: newSchedule.userName,
        date: Timestamp.fromDate(newSchedule.date),
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        shiftType: newSchedule.shiftType,
        status: newSchedule.status,
        notes: newSchedule.notes,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      });

      toast({
        title: "משמרת נוספה בהצלחה",
        description: "המשמרת החדשה נוספה לסידור",
      });
      setShowAddShiftDialog(false);
      
      // Reset form
      setNewSchedule({
        userId: "",
        userName: "",
        date: new Date(),
        startTime: "08:00",
        endTime: "16:00",
        shiftType: "morning",
        status: "scheduled",
        notes: ""
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת המשמרת",
        variant: "destructive",
      });
    }
  };

  const handleEditShift = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowEditShiftDialog(true);
  };

  const handleUpdateShift = async () => {
    if (!editingSchedule) return;

    // Check for conflicts when updating
    const conflicts = detectShiftConflicts(
      editingSchedule.userId, 
      editingSchedule.date?.toDate() || new Date(), 
      editingSchedule.startTime, 
      editingSchedule.endTime, 
      editingSchedule.id
    );

    if (conflicts.length > 0) {
      const conflictTimes = conflicts.map(c => `${c.startTime}-${c.endTime}`).join(', ');
      toast({
        title: "שגיאה - התנגשות משמרות",
        description: `העובד כבר מוקצה למשמרות: ${conflictTimes}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await update(editingSchedule.id!, {
        userId: editingSchedule.userId,
        userName: editingSchedule.userName,
        date: editingSchedule.date,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime,
        shiftType: editingSchedule.shiftType,
        status: editingSchedule.status,
        notes: editingSchedule.notes,
        updatedAt: new Date() as any
      });

      toast({
        title: "משמרת עודכנה בהצלחה",
        description: "המשמרת עודכנה במערכת",
      });
      setShowEditShiftDialog(false);
      setEditingSchedule(null);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון המשמרת",
        variant: "destructive",
      });
    }
  };

  const handleDeleteShift = async (scheduleId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק משמרת זו?")) {
      return;
    }

    try {
      await remove(scheduleId);
      toast({
        title: "משמרת נמחקה בהצלחה",
        description: "המשמרת נמחקה מהמערכת",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת המשמרת",
        variant: "destructive",
      });
    }
  };

  // Template handlers
  const handleCreateTemplate = () => {
    setNewTemplate({
      name: "",
      shiftType: 'morning',
      startTime: '08:00',
      endTime: '16:00',
      notes: ""
    });
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast({ title: 'שגיאה', description: 'נא להזין שם לתבנית', variant: 'destructive' });
      return;
    }
    try {
      await addTemplate({
        name: newTemplate.name,
        shiftType: newTemplate.shiftType,
        startTime: newTemplate.startTime,
        endTime: newTemplate.endTime,
        notes: newTemplate.notes,
        createdBy: 'manager',
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      } as any);
      setIsTemplateDialogOpen(false);
      toast({ title: 'התבנית נשמרה', description: `"${newTemplate.name}" נשמרה בהצלחה` });
    } catch (e) {
      toast({ title: 'שגיאה', description: 'שמירת התבנית נכשלה', variant: 'destructive' });
    }
  };

  const handleUseTemplate = (template: ShiftTemplate) => {
    setNewSchedule(ns => ({
      ...ns,
      startTime: template.startTime,
      endTime: template.endTime,
      shiftType: template.shiftType,
      notes: template.notes || ''
    }));
    setShowAddShiftDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast({ title: 'התבנית נמחקה', description: 'התבנית הוסרה מהרשימה' });
    } catch (e) {
      toast({ title: 'שגיאה', description: 'מחיקת התבנית נכשלה', variant: 'destructive' });
    }
  };

  const handleEmployeeSelect = (userId: string) => {
    const employee = employees.find((user: User) => user.id === userId);
    if (employee) {
      setNewSchedule({
        ...newSchedule,
        userId: userId,
        userName: employee.name
      });
    }
  };

  const handleApproveRequest = async (request: ShiftRequest) => {
    try {
      await updateRequest(request.id!, { status: 'approved' });
      toast({ title: 'בקשה אושרה', description: `${request.requesterName} עודכן באישור` });
    } catch (e) {
      toast({ title: 'שגיאה', description: 'לא ניתן לאשר בקשה', variant: 'destructive' });
    }
  };

  const handleRejectRequest = async (request: ShiftRequest) => {
    try {
      await updateRequest(request.id!, { status: 'rejected' });
      toast({ title: 'בקשה נדחתה', description: `${request.requesterName} עודכן בדחייה` });
    } catch (e) {
      toast({ title: 'שגיאה', description: 'לא ניתן לדחות בקשה', variant: 'destructive' });
    }
  };

  if (schedulesLoading || usersLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתוני תוכנית עבודה...</p>
        </div>
      </div>
    );
  }

  if (schedulesError || usersError) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת נתונים</h3>
          <p className="text-gray-600">{schedulesError?.message || usersError?.message}</p>
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
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">ניהול סידורי עבודה</h2>
            <p className="text-lg text-gray-600">תכנון והקצאת משמרות לכל הצוות</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3" dir="ltr">
          <TabsTrigger value="calendar">לוח שנה</TabsTrigger>
          <TabsTrigger value="weekly">סקירה שבועית</TabsTrigger>
          <TabsTrigger value="templates">תבניות</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6" dir="rtl">
          <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
            <Card className="w-fit">
              <CardHeader>
                <CardTitle>בחר תאריך</CardTitle>
                <CardDescription>בחר תאריך לצפייה בסידורים</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle> תוכנית עבודה{selectedDate.toLocaleDateString('he-IL')}</CardTitle>
                <CardDescription>משמרות מתוכננות ליום הנבחר</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduleDataArray.length > 0 ? (
                    scheduleDataArray.map((shiftGroup) => (
                      <div key={shiftGroup.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{shiftGroup.shift}</h4>
                            <p className="text-sm text-gray-600">{shiftGroup.time}</p>
                            {shiftGroup.filled < shiftGroup.required && (
                              <p className="text-xs text-orange-600 mt-1">
                                חסרים {shiftGroup.required - shiftGroup.filled} עובדים
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-reverse space-x-2">
                            <Badge variant={shiftGroup.filled >= shiftGroup.required ? "default" : "secondary"}>
                              {shiftGroup.filled}/{shiftGroup.required}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAddShiftDialog(true)}
                            >
                              הוסף משמרת
                              <Plus className="h-4 w-4 mr-2" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {shiftGroup.schedules.map((schedule: Schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{schedule.userName}</p>
                                <p className="text-sm text-gray-600">{schedule.status}</p>
                              </div>
                              <div className="flex space-x-reverse space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditShift(schedule)}
                                >
                                  ערוך
                                  <Edit className="h-3 w-3 mr-1" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => schedule.id && handleDeleteShift(schedule.id)}
                                >
                                  מחק
                                  <Trash className="h-3 w-3 mr-1" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">  אין תוכנית עבודה ליום זה </h3>
                      <p className="text-gray-600 mb-4">הוסף משמרות חדשות ליום זה</p>
                      <Button onClick={() => setShowAddShiftDialog(true)}>
                        הוסף משמרת
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle>סקירה שבועית</CardTitle>
              <CardDescription>מבט כללי על השבוע הקרוב</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weeklySchedule.map((day, index) => (
                  <div 
                    key={index} 
                    className={`text-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      day.dateObj.toDateString() === selectedDate.toDateString() ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedDate(day.dateObj)}
                  >
                    <p className="font-semibold">{day.day}</p>
                    <p className="text-sm text-gray-600">{day.date}</p>
                    <div className="mt-2">
                      <p className="text-lg font-bold">{day.shifts}</p>
                      <p className="text-xs text-gray-600">משמרות</p>
                    </div>
                    <div className="mt-2">
                      <Badge variant={day.coverage >= 90 ? "default" : day.coverage >= 70 ? "secondary" : "destructive"}>
                        {day.coverage}%
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">כיסוי</p>
                    </div>
                    {day.shifts === 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-orange-600">אין משמרות</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>סיכום שבועי</CardTitle>
              <CardDescription>סטטיסטיקות כלליות לשבוע</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">סה"כ משמרות</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {weeklySchedule.reduce((sum, day) => sum + day.shifts, 0)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">כיסוי ממוצע</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(weeklySchedule.reduce((sum, day) => sum + day.coverage, 0) / 7)}%
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">ימים עם כיסוי מלא</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {weeklySchedule.filter(day => day.coverage >= 100).length}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">ימים הזקוקים לתשומת לב</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {weeklySchedule.filter(day => day.coverage < 70).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="templates" className="space-y-6" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle>תבניות משמרות</CardTitle>
              <CardDescription>שמירה ושימוש בתבניות משמרות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין תבניות שמורות</h3>
                <p className="text-gray-600 mb-4">צור תבניות משמרות לשימוש חוזר</p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 ml-2" />
                  צור תבנית חדשה
                </Button>
              </div>
            </CardContent>
          </Card>

          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>התבניות שלי</CardTitle>
                <CardDescription>תבניות שיצרת לשימוש מהיר</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-gray-600">
                          סוג: {t.shiftType === 'morning' ? 'בוקר' : t.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה'} · שעות: {t.startTime}-{t.endTime}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleUseTemplate(t)}>
                          השתמש
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => t.id && handleDeleteTemplate(t.id)}>
                          מחק
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Examples */}
          <Card>
            <CardHeader>
              <CardTitle>תבניות מומלצות</CardTitle>
              <CardDescription>תבניות נפוצות שתוכל ליצור</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">תבנית משמרת בוקר</h4>
                  <p className="text-sm text-gray-600 mb-3">משמרת בוקר סטנדרטית 08:00-16:00</p>
                  <div className="space-y-1 text-sm">
                    <p>• 3 עובדים נדרשים</p>
                    <p>• שעות: 08:00-16:00</p>
                    <p>• מתאים לימי חול</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">תבנית משמרת אחר צהריים</h4>
                  <p className="text-sm text-gray-600 mb-3">משמרת אחר צהריים 16:00-24:00</p>
                  <div className="space-y-1 text-sm">
                    <p>• 4 עובדים נדרשים</p>
                    <p>• שעות: 16:00-24:00</p>
                    <p>• מתאים לימי חול</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">תבנית משמרת לילה</h4>
                  <p className="text-sm text-gray-600 mb-3">משמרת לילה 00:00-08:00</p>
                  <div className="space-y-1 text-sm">
                    <p>• 2 עובדים נדרשים</p>
                    <p>• שעות: 00:00-08:00</p>
                    <p>• מתאים לכל השבוע</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">תבנית סוף שבוע</h4>
                  <p className="text-sm text-gray-600 mb-3">משמרות מיוחדות לסוף שבוע</p>
                  <div className="space-y-1 text-sm">
                    <p>• 2 משמרות ביום</p>
                    <p>• שעות: 09:00-17:00, 17:00-01:00</p>
                    <p>• מתאים לימי שישי ושבת</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>צור תבנית משמרת חדשה</DialogTitle>
            <DialogDescription>הגדר תבנית מהירה לשימוש חוזר בסידורים</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">שם התבנית</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="לדוגמה: בוקר רגיל 3 נציגים"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">סוג משמרת</label>
                <Select value={newTemplate.shiftType} onValueChange={(value: any) => setNewTemplate({ ...newTemplate, shiftType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג משמרת" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">בוקר</SelectItem>
                    <SelectItem value="afternoon">אחר צהריים</SelectItem>
                    <SelectItem value="night">לילה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">שעת התחלה</label>
                <Input type="time" value={newTemplate.startTime} onChange={(e) => setNewTemplate({ ...newTemplate, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">שעת סיום</label>
                <Input type="time" value={newTemplate.endTime} onChange={(e) => setNewTemplate({ ...newTemplate, endTime: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">הערות</label>
              <Textarea
                value={newTemplate.notes}
                onChange={(e) => setNewTemplate({ ...newTemplate, notes: e.target.value })}
                placeholder="מידע נוסף לשימוש בעת יצירת משמרת מתבנית זו"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end space-x-reverse space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>ביטול</Button>
              <Button onClick={handleSaveTemplate}>שמור תבנית</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={showAddShiftDialog} onOpenChange={setShowAddShiftDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת משמרת חדשה</DialogTitle>
            <DialogDescription>הוסף משמרת חדשה ליום {selectedDate.toLocaleDateString('he-IL')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">עובד</label>
              <Select value={newSchedule.userId} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee: User) => (
                    <SelectItem key={employee.id} value={employee.id || ''}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">שעת התחלה</label>
                <Input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">שעת סיום</label>
                <Input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">סוג משמרת</label>
              <Select value={newSchedule.shiftType} onValueChange={(value: any) => setNewSchedule({...newSchedule, shiftType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג משמרת" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">בוקר</SelectItem>
                  <SelectItem value="afternoon">אחר צהריים</SelectItem>
                  <SelectItem value="night">לילה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">סטטוס</label>
              <Select value={newSchedule.status} onValueChange={(value: any) => setNewSchedule({...newSchedule, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">מתוכנן</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">הערות</label>
              <Input
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                placeholder="הערות נוספות..."
              />
            </div>
            <div className="flex justify-end space-x-reverse space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddShiftDialog(false)}>
                ביטול
              </Button>
              <Button onClick={handleAddShift}>
                הוסף משמרת
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={showEditShiftDialog} onOpenChange={setShowEditShiftDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת משמרת</DialogTitle>
            <DialogDescription>עדכן פרטי המשמרת</DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">עובד</label>
                <Input value={editingSchedule.userName} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">שעת התחלה</label>
                  <Input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">שעת סיום</label>
                  <Input
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">סוג משמרת</label>
                <Select value={editingSchedule.shiftType} onValueChange={(value: any) => setEditingSchedule({...editingSchedule, shiftType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג משמרת" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">בוקר</SelectItem>
                    <SelectItem value="afternoon">אחר צהריים</SelectItem>
                    <SelectItem value="night">לילה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">סטטוס</label>
                <Select value={editingSchedule.status} onValueChange={(value: any) => setEditingSchedule({...editingSchedule, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">מתוכנן</SelectItem>
                    <SelectItem value="confirmed">מאושר</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">הערות</label>
                <Input
                  value={editingSchedule.notes || ''}
                  onChange={(e) => setEditingSchedule({...editingSchedule, notes: e.target.value})}
                  placeholder="הערות נוספות..."
                />
              </div>
              <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditShiftDialog(false)}>
                  ביטול
                </Button>
                <Button onClick={handleUpdateShift}>
                  עדכן משמרת
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagement;