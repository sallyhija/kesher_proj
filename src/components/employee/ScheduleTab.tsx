
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, Download, Bell, Users, TrendingUp, CalendarDays, FileText } from "lucide-react";
import { useSchedules } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleTabProps {
  onOpenCalendar?: () => void;
}

const ScheduleTab = ({ onOpenCalendar }: ScheduleTabProps) => {
  const { currentUser } = useAuth();
  const { data: schedules, loading, error } = useSchedules();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Sample upcoming shifts data
  const upcomingShifts = [
    { 
      id: '1',
      date: "יום ראשון", 
      time: "08:00-16:00", 
      status: "confirmed",
      location: "משרד ראשי",
      type: "morning",
      notes: "משמרת בוקר רגילה"
    },
    { 
      id: '2',
      date: "יום שני", 
      time: "16:00-00:00", 
      status: "pending",
      location: "משרד ראשי",
      type: "afternoon",
      notes: "משמרת ערב - ממתין לאישור"
    },
    { 
      id: '3',
      date: "יום שלישי", 
      time: "08:00-16:00", 
      status: "confirmed",
      location: "משרד ראשי",
      type: "morning",
      notes: "משמרת בוקר רגילה"
    },
    { 
      id: '4',
      date: "יום רביעי", 
      time: "00:00-08:00", 
      status: "confirmed",
      location: "משרד ראשי",
      type: "night",
      notes: "משמרת לילה"
    },
  ];

  // Sample shift history data
  const shiftHistory = [
    {
      id: 'h1',
      date: "יום שני",
      time: "08:00-16:00",
      status: "completed",
      location: "משרד ראשי",
      type: "morning",
      hours: 8,
      overtime: 0,
      performance: 95
    },
    {
      id: 'h2',
      date: "יום שלישי",
      time: "16:00-00:00",
      status: "completed",
      location: "משרד ראשי",
      type: "afternoon",
      hours: 8,
      overtime: 2,
      performance: 88
    },
    {
      id: 'h3',
      date: "יום רביעי",
      time: "08:00-16:00",
      status: "completed",
      location: "משרד ראשי",
      type: "morning",
      hours: 8,
      overtime: 0,
      performance: 92
    }
  ];



  // Sample overtime data
  const overtimeData = {
    currentMonth: 12,
    lastMonth: 8,
    totalHours: 160,
    overtimeHours: 12,
    overtimeRate: 1.5
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'מאושר';
      case 'pending':
        return 'ממתין לאישור';
      case 'cancelled':
        return 'מבוטל';
      case 'completed':
        return 'הושלם';
      default:
        return 'לא ידוע';
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'afternoon':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'night':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'morning':
        return 'בוקר';
      case 'afternoon':
        return 'אחר צהריים';
      case 'night':
        return 'לילה';
      default:
        return 'לא ידוע';
    }
  };

  const handleExportSchedule = () => {
    // Simulate export functionality
    console.log('Exporting schedule...');
  };



  return (
    <div className="grid gap-6" dir="rtl">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">משמרות מאושרות</p>
                <p className="text-xl font-bold text-green-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">שעות נוספות</p>
                <p className="text-xl font-bold text-blue-600">{overtimeData.overtimeHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">ימי חופש</p>
                <p className="text-xl font-bold text-purple-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">סך שעות החודש</p>
                <p className="text-xl font-bold text-orange-600">{overtimeData.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onOpenCalendar} className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>לוח שנה מלא</span>
        </Button>

   

      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">משמרות קרובות</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
          <TabsTrigger value="overtime">שעות נוספות</TabsTrigger>
        </TabsList>

        {/* Upcoming Shifts Tab */}
        <TabsContent value="upcoming" dir="rtl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>המשמרות הקרובות שלי</CardTitle>
                  <CardDescription>
                    סקירה של המשמרות המתוכננות לשבוע הקרוב
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onOpenCalendar}
                  className="flex items-center space-x-reverse space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>לוח שנה מלא</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingShifts.map((shift, index) => (
                  <div 
                    key={shift.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedShift?.id === shift.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedShift(selectedShift?.id === shift.id ? null : shift)}
                  >
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="flex items-center space-x-reverse space-x-2">
                        {getStatusIcon(shift.status)}
                        <div>
                          <p className="font-medium">{shift.date}</p>
                          <div className="flex items-center space-x-reverse space-x-2 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{shift.time}</span>
                            <MapPin className="h-3 w-3" />
                            <span>{shift.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Badge variant="outline" className={getShiftTypeColor(shift.type)}>
                        {getShiftTypeText(shift.type)}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={
                          shift.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-300' :
                          shift.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          shift.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }
                      >
                        {getStatusText(shift.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Shift Details */}
              {selectedShift && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold mb-3">פרטי המשמרת</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">תאריך:</p>
                      <p className="font-medium">{selectedShift.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">שעות:</p>
                      <p className="font-medium">{selectedShift.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">מיקום:</p>
                      <p className="font-medium">{selectedShift.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">סוג משמרת:</p>
                      <p className="font-medium">{getShiftTypeText(selectedShift.type)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">הערות:</p>
                      <p className="font-medium">{selectedShift.notes}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      צפייה בפרטים נוספים
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shift History Tab */}
        <TabsContent value="history" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle>היסטוריית משמרות</CardTitle>
              <CardDescription>סקירה של משמרות שהושלמו</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shiftHistory.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="flex items-center space-x-reverse space-x-2">
                        {getStatusIcon(shift.status)}
                        <div>
                          <p className="font-medium">{shift.date}</p>
                          <div className="flex items-center space-x-reverse space-x-2 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{shift.time}</span>
                            <span>•</span>
                            <span>{shift.hours} שעות</span>
                            {shift.overtime > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-orange-600">{shift.overtime} שעות נוספות</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Badge variant="outline" className={getShiftTypeColor(shift.type)}>
                        {getShiftTypeText(shift.type)}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {shift.performance}% ביצועים
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overtime Tab */}
        <TabsContent value="overtime" dir="rtl">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>שעות נוספות</CardTitle>
                <CardDescription>סקירה של שעות נוספות החודש</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{overtimeData.overtimeHours}</p>
                    <p className="text-sm text-gray-600">שעות נוספות החודש</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{overtimeData.overtimeRate}x</p>
                    <p className="text-sm text-gray-600">קצב תשלום</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{overtimeData.overtimeHours * overtimeData.overtimeRate}</p>
                    <p className="text-sm text-gray-600">שעות בתשלום</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>בקשת שעות נוספות</CardTitle>
                <CardDescription>בקש אישור לשעות נוספות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">יום שני - משמרת בוקר</p>
                        <p className="text-sm text-gray-600">בקשה לשעתיים נוספות</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        ממתין לאישור
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    בקש שעות נוספות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default ScheduleTab;
