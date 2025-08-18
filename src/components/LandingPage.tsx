
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Shield, Star, ArrowLeft } from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

const LandingPage = ({ onNavigateToLogin, onNavigateToSignup }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100" dir="rtl">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/8d7af1d1-9ae2-47bf-82bc-501ae6bbb202.png" 
                alt="לוגו קשר" 
                className="h-28 w-28"
              />
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors px-2"> שירותים </a>
              <a href="#team" className="text-gray-600 hover:text-emerald-600 transition-colors px-2">הצוות</a>
              <a href="#about" className="text-gray-600 hover:text-emerald-600 transition-colors px-2">אודותינו</a>
              <a href="#contact" className="text-gray-600 hover:text-emerald-600 transition-colors px-2">צור קשר</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={onNavigateToSignup}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                הרשמה כעובד חדש
              </Button>
              <Button 
                onClick={onNavigateToLogin}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                כניסה למערכת
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-rubik">
            ברוכים הבאים ל<em>קשר</em>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            פלטפורמה מתקדמת לניהול תקשורת פנים ארגונית, המאפשרת לעובדים ומנהלים לעבוד ביעילות ובשיתוף פעולה
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={onNavigateToSignup}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              הרשמה כעובד חדש
            </Button>
            <Button 
              onClick={onNavigateToLogin}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3"
            >
              כניסה למערכת
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          למה לבחור ב<em>קשר</em>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-center">ניהול צוות מתקדם</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                כלים מתקדמים לניהול צוותים, תיאום משימות ומעקב אחר התקדמות
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-center">ניהול תוכנית עבודה</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                תכנון משמרות, תוכנית עבודה זמנים ומעקב אחר נוכחות עובדים
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-center">אבטחה מתקדמת</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                מערכת אבטחה חזקה עם הרשאות מבוססות תפקידים
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-center">דוחות וניתוחים</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                דוחות מפורטים וניתוח ביצועים לצורך קבלת החלטות מושכלות
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                  alt="לוגו קשר" 
                  className="h-8 w-8"
                />
              </div>
              <CardTitle className="text-center">תקשורת פנימית</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                מערכת הודעות מתקדמת לתקשורת פנימית יעילה
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowLeft className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-center">ממשק עברי</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-center">
                ממשק משתמש בעברית עם תמיכה מלאה ב-RTL
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">אודותינו</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            <em>קשר</em> היא פלטפורמה מתקדמת לניהול תקשורת ארגונית שפותחה במיוחד עבור חברות ישראליות. 
            המערכת מספקת כלים מקיפים לניהול צוותים, סידורי עבודה ותקשורת פנימית, 
            תוך שמירה על אבטחה גבוהה ונוחות שימוש מקסימלית.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">צור קשר</h2>
          <p className="text-lg text-gray-600 mb-8">
            יש לך שאלות? אנחנו כאן לעזור!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              onClick={onNavigateToLogin}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              התחל עכשיו
            </Button>
            <Button 
              onClick={onNavigateToSignup}
              size="lg"
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              הרשמה חינם
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/8d7af1d1-9ae2-47bf-82bc-501ae6bbb202.png" 
              alt="לוגו קשר" 
              className="h-16 w-16 mx-auto mb-4"
            />
            <p className="text-lg font-semibold mb-2">קשר</p>
            <p className="text-gray-400">
              פלטפורמה מתקדמת לניהול תקשורת ארגונית
            </p>
            <p className="text-gray-500 mt-4">
              © 2024 קשר. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
