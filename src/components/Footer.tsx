/**
 * קומפוננטת Footer - תחתית הדף
 * 
 * קומפוננטה זו מציגה את תחתית הדף עם:
 * - לוגו החברה
 * - שם החברה "קשר"
 * - תיאור הפלטפורמה
 * - זכויות יוצרים
 * 
 * הקומפוננטה משתמשת בעיצוב כהה (bg-gray-900) עם טקסט לבן
 * ותמיד ממוקמת בתחתית הדף באמצעות mt-auto
 */
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* לוגו החברה - תמונת PNG עם גודל מותאם */}
          <img 
            src="/lovable-uploads/8d7af1d1-9ae2-47bf-82bc-501ae6bbb202.png" 
            alt="לוגו קשר" 
            className="h-12 w-12 mx-auto mb-3"
          />
          
          {/* שם החברה - מודגש בגודל גדול */}
          <p className="text-lg font-semibold mb-2">קשר</p>
          
          {/* תיאור הפלטפורמה - טקסט אפור בהיר */}
          <p className="text-gray-400 text-sm">
            פלטפורמה מתקדמת לניהול תקשורת ארגונית
          </p>
          
          {/* זכויות יוצרים - טקסט קטן יותר באפור כהה */}
          <p className="text-gray-500 mt-3 text-xs">
            © 2024 קשר. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
