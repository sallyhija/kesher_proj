/**
 * קומפוננטת ManagerDashboard - דשבורד מנהלים למערכת "קשר"
 * 
 * קומפוננטה זו מהווה את הממשק הראשי למנהלים במערכת ומציגה:
 * - סטטיסטיקות מהירות (שיחות, זמני המתנה, שביעות רצון, עובדים במשמרת)
 * - התראות דחופות
 * - טאבים לניהול צוות, סידורי עבודה והודעות
 * - ניווט בין תצוגות שונות
 * 
 * תכונות:
 * - ניהול מצב תצוגה (dashboard, staff, schedule, messages)
 * - ניהול טאבים פנימיים
 * - אינטגרציה עם קומפוננטות ניהול מתקדמות
 * - תצוגה מותאמת למסכים שונים
 * 
 * הקומפוננטה משתמשת ב-state מקומי לניהול הניווט
 * ומעבירה props לקומפוננטות הניהול השונות
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Users, 
  Clock, 
  Bell, 
  Home,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import StaffManagement from "./manager/StaffManagement";
import ScheduleManagement from "./manager/ScheduleManagement";
import ManagerMessaging from "./messaging/ManagerMessaging";

import ManagerNavbar from "./navigation/ManagerNavbar";
import Footer from "./Footer";

// הגדרת Props לקומפוננטה
interface ManagerDashboardProps {
  onBack: () => void; // פונקציה לחזרה לדף הבית
}

const ManagerDashboard = ({ onBack }: ManagerDashboardProps) => {
  // State לניהול התצוגה הנוכחית
  const [currentView, setCurrentView] = useState<'dashboard' | 'staff' | 'schedule' | 'messages'>('dashboard');
  
  // State לניהול הטאב הפעיל בדשבורד הראשי
  const [activeTab, setActiveTab] = useState<'staff' | 'schedule' | 'messages'>('staff');
  
  /**
   * פונקציה לניווט בין תצוגות שונות
   * @param view - התצוגה הרצויה
   */
  const handleNavigate = (view: 'dashboard' | 'staff' | 'schedule' | 'messages') => {
    setCurrentView(view);
  };

  /**
   * פונקציה לחזרה לדשבורד הראשי
   * נקראת בלחיצה על הלוגו
   */
  const handleLogoClick = () => {
    setCurrentView('dashboard');
  };

  /**
   * פונקציה לשינוי טאב בדשבורד הראשי
   * @param tab - הטאב החדש
   */
  const handleTabChange = (tab: 'staff' | 'schedule' | 'messages') => {
    setActiveTab(tab);
  };

  // נתוני עובדים לדוגמה - בדשבורד הראשי
  const staffData = [
    { name: "יואב כהן", role: "נציג שירות", status: "פעיל", shift: "08:00-16:00", performance: 92 },
    { name: "שרה לוי", role: "נציג שירות", status: "פעיל", shift: "08:00-16:00", performance: 88 },
    { name: "דני גבריאל", role: "נציג בכיר", status: "הפסקה", shift: "16:00-00:00", performance: 95 },
    { name: "מיכל דוד", role: "נציג שירות", status: "לא פעיל", shift: "00:00-08:00", performance: 85 },
  ];

  // סטטיסטיקות יומיות לדוגמה
  const todayStats = {
    totalCalls: 1247, // סך כל השיחות היום
    avgWaitTime: "2:34", // זמן המתנה ממוצע
    satisfaction: 4.2, // דירוג שביעות רצון
    staffOnDuty: 12 // מספר עובדים במשמרת
  };

  // הודעות דחופות לדוגמה
  const urgentMessages = [
    { type: "alert", message: "מחסור בכוח אדם במשמרת לילה", time: "לפני 15 דקות" },
    { type: "info", message: "עדכון מערכת בשעה 14:00", time: "לפני שעה" },
    { type: "warning", message: "זמן המתנה גבוה מהרגיל", time: "לפני 2 שעות" },
  ];

  // טיפול בניווט לתצוגות שונות
  if (currentView === 'staff') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col" dir="rtl">
        <ManagerNavbar onBack={onBack} currentView={currentView} onNavigate={handleNavigate} onLogoClick={handleLogoClick} />
        <div className="flex-1">
          <StaffManagement onBack={() => setCurrentView('dashboard')} />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentView === 'schedule') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col" dir="rtl">
        <ManagerNavbar onBack={onBack} currentView={currentView} onNavigate={handleNavigate} onLogoClick={handleLogoClick} />
        <div className="flex-1">
          <ScheduleManagement onBack={() => setCurrentView('dashboard')} />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentView === 'messages') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col" dir="rtl">
        <ManagerNavbar onBack={onBack} currentView={currentView} onNavigate={handleNavigate} onLogoClick={handleLogoClick} />
        <div className="flex-1">
          <ManagerMessaging onBack={() => setCurrentView('dashboard')} />
        </div>
        <Footer />
      </div>
    );
  }

  // תצוגת הדשבורד הראשי
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col" dir="rtl">
      {/* כותרת ניווט */}
      <ManagerNavbar onBack={onBack} currentView={currentView} onNavigate={setCurrentView} onLogoClick={handleLogoClick} />

      {/* תוכן ראשי של הדשבורד */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* סטטיסטיקות מהירות - 4 כרטיסים בשורה */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* כרטיס שיחות היום */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">שיחות היום</p>
                  <p className="text-2xl font-bold text-emerald-600">{todayStats.totalCalls}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          {/* כרטיס זמן המתנה ממוצע */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">זמן המתנה ממוצע</p>
                  <p className="text-2xl font-bold text-orange-600">{todayStats.avgWaitTime}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          {/* כרטיס שביעות רצון */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">שביעות רצון</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.satisfaction}/5</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* כרטיס עובדים במשמרת */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">עובדים במשמרת</p>
                  <p className="text-2xl font-bold text-violet-600">{todayStats.staffOnDuty}</p>
                </div>
                <Users className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* התראות דחופות - כרטיס כתום */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span>התראות דחופות</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* רשימת ההתראות */}
              {urgentMessages.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-reverse space-x-3">
                    {/* אינדיקטור סוג ההתראה */}
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'alert' ? 'bg-red-500' : 
                      alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* טאבים ראשיים לניהול */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* רשימת הטאבים */}
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="staff" className="flex items-center space-x-reverse space-x-2">
              <Users className="h-4 w-4" />
              <span>ניהול צוות</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-reverse space-x-2">
              <Calendar className="h-4 w-4" />
              <span>  תוכנית עבודה  </span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-reverse space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>הודעות</span>
            </TabsTrigger>
          </TabsList>

          {/* תוכן טאב ניהול צוות */}
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">צוות משמרת נוכחית</CardTitle>
                <CardDescription className="text-right">
                  מצב והביצועים של העובדים במשמרת הנוכחית
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* רשימת העובדים במשמרת */}
                  {staffData.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-reverse space-x-4">
                        {/* תג סטטוס העובד */}
                        <Badge 
                          variant="outline"
                          className={
                            employee.status === 'פעיל' ? 'bg-green-100 text-green-800 border-green-300' : 
                            employee.status === 'הפסקה' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                            'bg-red-100 text-red-800 border-red-300'
                          }
                        >
                          {employee.status}
                        </Badge>
                        
                        {/* מידע על המשמרת והביצועים */}
                        <div className="text-right">
                          <p className="text-sm font-medium">{employee.shift}</p>
                          <div className="flex items-center space-x-reverse space-x-2">
                            <span className="text-xs text-gray-600">ביצועים:</span>
                            <Progress value={employee.performance} className="w-16 h-2" />
                            <span className="text-xs font-medium">{employee.performance}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* פרטי העובד ותמונת פרופיל */}
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                        <Avatar>
                          <AvatarFallback>{employee.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* כפתור למעבר לניהול מתקדם של הצוות */}
                <Button className="w-full mt-4" variant="outline" onClick={() => setCurrentView('staff')}>
                  ניהול מתקדם של הצוות
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* תוכן טאב ניהול סידורי עבודה */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader dir="rtl">
                <CardTitle>ניהול סידורי עבודה</CardTitle>
                <CardDescription>
                  תכנון והקצאת משמרות לכל הצוות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">לוח זמנים מתקדם</h3>
                  <p className="text-gray-600 mb-4">כלי ניהול מתקדם לתכנון משמרות ופיקוח</p>
                  <Button onClick={() => setCurrentView('schedule')}>פתח את מנהל הסידורים</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* תוכן טאב הודעות */}
          <TabsContent value="messages">
            <Card>
              <CardHeader dir="rtl">
                <CardTitle>מערכת הודעות מנהלים</CardTitle>
                <CardDescription>
                  שליחת הודעות והתראות לצוות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">מרכז הודעות</h3>
                  <p className="text-gray-600 mb-4">שלח הודעות לעובדים או לקבוצות ספציפיות</p>
                  <div className="flex space-x-reverse space-x-2 justify-center">
                    <Button onClick={() => setCurrentView('messages')}>הודעה חדשה</Button>
                    <Button variant="outline" onClick={() => setCurrentView('messages')}>הודעות קבוצתיות</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default ManagerDashboard;
