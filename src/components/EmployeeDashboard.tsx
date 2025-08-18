
/**
 * קומפוננטת EmployeeDashboard - דשבורד עובדים למערכת "קשר"
 * 
 * קומפוננטה זו מהווה את הממשק הראשי לעובדים במערכת ומציגה:
 * - סטטיסטיקות מהירות (הודעות שלא נקראו, משמרות השבוע)
 * - טאבים לניהול לוח זמנים, הודעות ואזור אישי
 * - ניווט בין תצוגות שונות (דשבורד, לוח שנה)
 * - כותרת עם ניווט ומידע על הודעות שלא נקראו
 * 
 * תכונות:
 * - ניהול מצב תצוגה (dashboard, calendar)
 * - ניהול טאבים פנימיים
 * - אינטגרציה עם קומפוננטות עובדים שונות
 * - תצוגה מותאמת למסכים שונים
 * 
 * הקומפוננטה משתמשת ב-AuthContext לנתוני המשתמש
 * ו-useFirestore לספירת הודעות שלא נקראו
 */

import { useState } from "react";
import EmployeeHeader from "./employee/EmployeeHeader";
import QuickStats from "./employee/QuickStats";
import DashboardTabs from "./employee/DashboardTabs";
import CalendarView from "./employee/CalendarView";
<<<<<<< HEAD
import { useUnreadMessagesCount } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "./Footer";
=======
import BreakTimeDialog from "./employee/BreakTimeDialog";
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9

// הגדרת Props לקומפוננטה
interface EmployeeDashboardProps {
  onBack: () => void; // פונקציה לחזרה לדף הבית
  onOpenPersonalArea: () => void; // פונקציה לפתיחת האזור האישי
}

<<<<<<< HEAD
const EmployeeDashboard = ({ onBack, onOpenPersonalArea }: EmployeeDashboardProps) => {
  // Hooks לניהול אימות ונתונים
  const { currentUser } = useAuth();
  const { count: unreadMessages, loading: unreadLoading } = useUnreadMessagesCount(currentUser?.uid);
  
  // State לניהול הטאב הפעיל והתצוגה הנוכחית
  const [activeTab, setActiveTab] = useState("schedule"); // טאב ברירת מחדל: לוח זמנים
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard'); // תצוגה נוכחית
=======
const EmployeeDashboard = ({ onBack, onOpenInbox, onOpenPersonalArea }: EmployeeDashboardProps) => {
  const [unreadMessages] = useState(3);
  const [unreadEmails] = useState(7);
  const [activeTab, setActiveTab] = useState("schedule");
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9

  /**
   * פונקציה לניווט בין טאבים
   * מעדכנת את הטאב הפעיל ומדפיסה לוג לבדיקה
   * @param tabValue - הטאב החדש
   */
  const handleNavigateToTab = (tabValue: string) => {
    console.log('EmployeeDashboard: handleNavigateToTab called with:', tabValue);
    console.log('Previous activeTab was:', activeTab);
    setActiveTab(tabValue);
    console.log('New activeTab set to:', tabValue);
  };

  /**
   * פונקציה לפתיחת תצוגת לוח שנה
   * מעבירה את המשתמש לתצוגת לוח שנה
   */
  const handleOpenCalendar = () => {
    setCurrentView('calendar');
  };

  /**
   * פונקציה לפתיחת טאב הודעות
   * מפעילה את הטאב של הודעות
   */
  const handleOpenMessages = () => {
    setActiveTab('messages');
  };

  /**
   * פונקציה לחזרה לדשבורד הראשי
   * נקראת בלחיצה על הלוגו
   * מחזירה לתצוגת דשבורד עם טאב ברירת מחדל
   */
  const handleLogoClick = () => {
    setCurrentView('dashboard');
    setActiveTab('schedule');
  };

<<<<<<< HEAD
  // תצוגת לוח שנה - כאשר המשתמש בוחר בתצוגה זו
=======
  const handleOpenBreakSettings = () => {
    setBreakDialogOpen(true);
  };

>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9
  if (currentView === 'calendar') {
    console.log('EmployeeDashboard: Rendering calendar view with activeTab:', activeTab);
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col">
        {/* כותרת עם ניווט */}
        <EmployeeHeader 
          onBack={onBack} 
          onOpenPersonalArea={onOpenPersonalArea} 
          onLogoClick={handleLogoClick}
          activeTab={activeTab}
          onTabChange={handleNavigateToTab}
          unreadMessages={unreadMessages}
        />
        
        {/* תוכן ראשי - תצוגת לוח שנה */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <CalendarView onBack={() => setCurrentView('dashboard')} />
        </main>
        
        {/* תחתית הדף */}
        <Footer />
      </div>
    );
  }

  // תצוגת הדשבורד הראשי
  console.log('EmployeeDashboard: Rendering main dashboard with activeTab:', activeTab);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 rtl flex flex-col">
      {/* כותרת עם ניווט ומידע על הודעות */}
      <EmployeeHeader 
        onBack={onBack} 
        onOpenPersonalArea={onOpenPersonalArea} 
        onLogoClick={handleLogoClick}
        activeTab={activeTab}
        onTabChange={handleNavigateToTab}
        unreadMessages={unreadMessages}
      />

<<<<<<< HEAD
      {/* תוכן ראשי של הדשבורד */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* אזור סטטיסטיקות מהירות */}
          <div>
            {/* קומפוננטת סטטיסטיקות מהירות */}
            <QuickStats 
              unreadMessages={unreadMessages} 
              onOpenMessages={handleOpenMessages}
              onOpenCalendar={handleOpenCalendar}
            />
          </div>
        
        {/* טאבים ראשיים של הדשבורד */}
=======
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickStats 
          unreadMessages={unreadMessages} 
          unreadEmails={unreadEmails}
          onOpenMessages={handleOpenMessages}
          onOpenEmails={handleOpenEmails}
          onOpenCalendar={handleOpenCalendar}
          onOpenBreakSettings={handleOpenBreakSettings}
        />
        
        <div className="mb-8">
          <ProgressIncentive />
        </div>
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9
        <DashboardTabs 
          unreadMessages={unreadMessages} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCalendar={handleOpenCalendar}
        />
        
        <BreakTimeDialog 
          open={breakDialogOpen}
          onOpenChange={setBreakDialogOpen}
        />
      </main>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;
