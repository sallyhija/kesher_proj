/**
 * קומפוננטת EmployeeSignup - טופס הרשמה לעובדים חדשים
 * 
 * קומפוננטה זו מאפשרת לעובדים חדשים להירשם למערכת "קשר" עם:
 * - פרטים אישיים (שם פרטי, שם משפחה, אימייל, טלפון)
 * - פרטי עבודה (מספר עובד, מחלקה)
 * - פרטי אבטחה (סיסמה ואישור סיסמה)
 * 
 * תכונות:
 * - אימות טופס מקיף
 * - טיפול בשגיאות הרשמה
 * - מצב טעינה
 * - ניווט חזרה לדף הבית
 * - קישור להתחברות למשתמשים קיימים
 * 
 * הקומפוננטה משתמשת ב-AuthContext לניהול הרשמה
 * ו-toast להצגת הודעות למשתמש
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Footer from "./Footer";

// הגדרת Props לקומפוננטה
interface EmployeeSignupProps {
  onNavigateToLogin: () => void; // פונקציה למעבר למסך התחברות
  onBack: () => void; // פונקציה לחזרה לדף הבית
}

const EmployeeSignup = ({ onNavigateToLogin, onBack }: EmployeeSignupProps) => {
  // State לניהול נתוני הטופס
  const [formData, setFormData] = useState({
    firstName: "", // שם פרטי
    lastName: "", // שם משפחה
    email: "", // כתובת אימייל
    phone: "", // מספר טלפון
    employeeId: "", // מספר עובד
    department: "", // מחלקה
    password: "", // סיסמה
    confirmPassword: "" // אישור סיסמה
  });
  
  // State לניהול מצב הטופס
  const [isLoading, setIsLoading] = useState(false); // מצב טעינה בזמן הרשמה
  const [errors, setErrors] = useState<Record<string, string>>({}); // שגיאות אימות
  
  // Hooks לניהול אימות וטוסט
  const { signup } = useAuth();
  const { toast } = useToast();

  /**
   * פונקציה לאימות הטופס
   * בודקת שכל השדות החובה מלאים ושהנתונים תקינים
   * @returns true אם הטופס תקין, false אחרת
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // בדיקת שם פרטי
    if (!formData.firstName.trim()) {
      newErrors.firstName = "שם פרטי הוא שדה חובה";
    }

    // בדיקת שם משפחה
    if (!formData.lastName.trim()) {
      newErrors.lastName = "שם משפחה הוא שדה חובה";
    }

    // בדיקת אימייל - חובה ותקינות
    if (!formData.email.trim()) {
      newErrors.email = "אימייל הוא שדה חובה";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "אימייל לא תקין";
    }

    // בדיקת טלפון
    if (!formData.phone.trim()) {
      newErrors.phone = "מספר טלפון הוא שדה חובה";
    }

    // בדיקת מספר עובד
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "מספר עובד הוא שדה חובה";
    }

    // בדיקת מחלקה
    if (!formData.department.trim()) {
      newErrors.department = "מחלקה היא שדה חובה";
    }

    // בדיקת סיסמה - חובה ואורך מינימלי
    if (!formData.password) {
      newErrors.password = "סיסמה היא שדה חובה";
    } else if (formData.password.length < 6) {
      newErrors.password = "סיסמה חייבת להיות לפחות 6 תווים";
    }

    // בדיקת התאמת סיסמאות
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "סיסמאות אינן תואמות";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * פונקציה לטיפול בשליחת הטופס
   * מבצעת אימות ויצירת חשבון חדש באמצעות Firebase Auth
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // אימות הטופס לפני שליחה
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // הכנת נתוני המשתמש ל-Firestore
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: 'employee' as const,
        department: formData.department,
        position: 'נציג שירות',
        phone: formData.phone,
        isActive: true
      };

      // יצירת חשבון חדש
      await signup(formData.email, formData.password, userData);
      
      // הצגת הודעת הצלחה
      toast({
        title: "הרשמה מוצלחת",
        description: "חשבון נוצר בהצלחה! כעת תוכל להתחבר למערכת",
      });
      
      // מעבר למסך התחברות
      onNavigateToLogin();
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // הצגת הודעת שגיאה מתאימה לפי סוג השגיאה
      let errorMessage = "שגיאה בהרשמה";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "כתובת האימייל כבר קיימת במערכת";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "הסיסמה חייבת להיות לפחות 6 תווים";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "כתובת אימייל לא תקינה";
      }
      
      toast({
        title: "שגיאה בהרשמה",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * פונקציה לעדכון שדה בטופס
   * @param field - שם השדה לעדכון
   * @param value - הערך החדש
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col" dir="rtl">
      {/* כותרת ניווט עם לוגו וקישורים */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* צד שמאל - כפתור חזרה ולוגו */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onBack}
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>חזרה לדף הבית</span>
              </Button>
              
              {/* לוגו החברה עם שם */}
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <img 
                    src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                    alt="לוגו קשר" 
                    className="h-6 w-6"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 font-varela"><em>קשר</em></span>
              </div>
            </div>
            
            {/* צד ימין - קישור להתחברות */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">כבר יש לך חשבון?</span>
              <Button 
                onClick={onNavigateToLogin}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                התחבר כאן
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* תוכן מרכזי - טופס ההרשמה */}
      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            {/* לוגו וכותרת הטופס */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-emerald-600 p-3 rounded-lg ml-2">
                <img 
                  src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                  alt="לוגו קשר" 
                  className="h-6 w-6"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900 font-varela"><em>קשר</em></span>
            </div>
            
            <CardTitle className="text-2xl">הרשמה כעובד חדש</CardTitle>
            <CardDescription>
              צור חשבון חדש כדי להצטרף למערכת
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* שדות שם - בשורה אחת */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                    required
                  />
                  {/* הצגת שגיאה אם קיימת */}
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* שדה אימייל */}
              <div className="space-y-2">
                <Label htmlFor="email">כתובת אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* שדה טלפון */}
              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* שדות עבודה - בשורה אחת */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">מספר עובד</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                    className={errors.employeeId ? "border-red-500" : ""}
                    required
                  />
                  {errors.employeeId && (
                    <p className="text-sm text-red-500">{errors.employeeId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">מחלקה</Label>
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className={errors.department ? "border-red-500" : ""}
                    required
                  />
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department}</p>
                  )}
                </div>
              </div>

              {/* שדה סיסמה */}
              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* שדה אישור סיסמה */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">אישור סיסמה</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* כפתור הרשמה */}
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "מרשם..." : "הרשמה למערכת"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* קישור להתחברות למשתמשים קיימים */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                כבר יש לך חשבון?
              </p>
              <Button
                variant="outline"
                onClick={onNavigateToLogin}
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                כניסה למערכת
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default EmployeeSignup;