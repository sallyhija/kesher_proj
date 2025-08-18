
/**
 * קומפוננטת LoginForm - טופס התחברות למערכת
 * 
 * קומפוננטה זו מאפשרת למשתמשים להתחבר למערכת "קשר" באמצעות:
 * - כתובת אימייל
 * - סיסמה (עם אפשרות להצגה/הסתרה)
 * 
 * תכונות:
 * - אימות טופס
 * - טיפול בשגיאות התחברות
 * - מצב טעינה
 * - ניווט חזרה לדף הבית
 * - קישור להרשמה לעובדים חדשים
 * 
 * הקומפוננטה משתמשת ב-AuthContext לניהול מצב המשתמש
 * ו-toast להצגת הודעות למשתמש
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Footer from "./Footer";

// הגדרת Props לקומפוננטה
interface LoginFormProps {
  onLogin: (userRole: 'employee' | 'manager') => void; // פונקציה להחזרת תפקיד המשתמש
  onBack?: () => void; // פונקציה אופציונלית לחזרה לדף הבית
}

const LoginForm = ({ onLogin, onBack }: LoginFormProps) => {
  // State לניהול הטופס
  const [email, setEmail] = useState(""); // כתובת האימייל
  const [password, setPassword] = useState(""); // הסיסמה
  const [showPassword, setShowPassword] = useState(false); // האם להציג את הסיסמה
  const [isLoading, setIsLoading] = useState(false); // מצב טעינה בזמן התחברות
  
  // Hooks לניהול אימות וטוסט
  const { login } = useAuth();
  const { toast } = useToast();

  /**
   * פונקציה לטיפול בשליחת הטופס
   * מבצעת אימות התחברות באמצעות Firebase Auth
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ניסיון התחברות באמצעות AuthContext
      await login(email, password);
      
      // הצגת הודעת הצלחה
      toast({
        title: "התחברות מוצלחת",
        description: "ברוכים הבאים למערכת קשר",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // הצגת הודעת שגיאה מתאימה
      toast({
        title: "שגיאה בהתחברות",
        description: error.message || "שם משתמש או סיסמה שגויים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col" dir="rtl">
      {/* כותרת ניווט עם לוגו וקישורים */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* צד שמאל - כפתור חזרה ולוגו */}
            <div className="flex items-center space-x-4">
              {/* כפתור חזרה לדף הבית - מוצג רק אם יש פונקציית onBack */}
              {onBack && (
                <Button 
                  onClick={onBack}
                  variant="outline" 
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>חזרה לדף הבית</span>
                </Button>
              )}
              
              {/* לוגו החברה עם שם */}
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <img 
                    src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                    alt="לוגו קשר" 
                    className="h-6 w-6"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900"><em>קשר</em></span>
              </div>
            </div>
            
            {/* צד ימין - קישור להרשמה */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">עובד חדש?</span>
              <Button 
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                הירשם כאן
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* תוכן מרכזי - טופס ההתחברות */}
      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {/* לוגו גדול במרכז הכרטיס */}
            <div className="bg-emerald-600 p-3 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img 
                src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                alt="לוגו קשר" 
                className="h-8 w-8"
              />
            </div>
            
            {/* כותרת ותיאור הטופס */}
            <CardTitle className="text-2xl text-center">כניסה למערכת קשר</CardTitle>
            <CardDescription className="text-center">
              היכנסו עם פרטי המשתמש שלכם
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* שדה אימייל */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="הכנס כתובת אימייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
              
              {/* שדה סיסמה עם אפשרות הצגה/הסתרה */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">סיסמה</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="הכנס סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-right pr-10"
                  />
                  
                  {/* כפתור הצגה/הסתרה של הסיסמה */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* כפתור התחברות */}
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default LoginForm;
