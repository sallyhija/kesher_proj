/**
 * דף NotFound - דף 404 למסלולים שלא קיימים
 * 
 * קומפוננטה זו מציגה דף שגיאה 404 כאשר המשתמש מנסה לגשת למסלול
 * שלא קיים במערכת. הדף כולל:
 * - הודעת שגיאה ברורה
 * - קישור חזרה לדף הבית
 * - לוג של הניסיון לגישה למסלול לא קיים
 * 
 * תכונות:
 * - לוג אוטומטי של שגיאות 404
 * - עיצוב פשוט ונקי
 * - ניווט חזרה לדף הבית
 * - תצוגה מותאמת למסכים שונים
 * 
 * הקומפוננטה משתמשת ב-useLocation לקבלת הנתיב הנוכחי
 * ו-useEffect ללוג השגיאה
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../components/Footer";

const NotFound = () => {
  // Hook לקבלת מידע על הנתיב הנוכחי
  const location = useLocation();

  /**
   * Effect ללוג שגיאות 404
   * מתבצע בכל פעם שהנתיב משתנה
   */
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* תוכן מרכזי - הודעת השגיאה */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* קוד השגיאה - גדול ומודגש */}
          <h1 className="text-4xl font-bold mb-4">404</h1>
          
          {/* הודעת השגיאה */}
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          
          {/* קישור חזרה לדף הבית */}
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default NotFound;
