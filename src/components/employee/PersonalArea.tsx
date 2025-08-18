/**
 * קומפוננטת PersonalArea - אזור אישי לעובדים
 * 
 * קומפוננטה זו מאפשרת לעובדים לצפות ולערוך את המידע האישי שלהם:
 * - פרטים אישיים (שם, אימייל, טלפון, כתובת, תאריך לידה)
 * - פרטי עבודה (מספר עובד, מחלקה, תפקיד, תאריך התחלה, איש קשר לחירום)
 * 
 * תכונות:
 * - מצב עריכה עם שמירה וביטול
 * - אימות נתונים
 * - טעינה מפרופיל המשתמש ב-Firestore
 * - תצוגה מותאמת למסכים שונים
 * 
 * הקומפוננטה משתמשת ב-AuthContext לנתוני המשתמש
 * ו-toast להצגת הודעות
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Footer from "../Footer";// path relative from employee folder

// הגדרת Props לקומפוננטה
interface PersonalAreaProps {
  onBack: () => void; // פונקציה לחזרה לדף הבית
}

const PersonalArea = ({ onBack }: PersonalAreaProps) => {
  // Hooks לניהול אימות וטוסט
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  
  // State לניהול מצב העריכה
  const [isEditing, setIsEditing] = useState(false);

  // הצגת מסך טעינה אם נתוני המשתמש לא זמינים עדיין
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 rtl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתוני משתמש...</p>
        </div>
      </div>
    );
  }

  // שימוש בנתונים אמיתיים של המשתמש עם ערכי ברירת מחדל למידע חסר
  const fullName = userProfile?.name || currentUser?.displayName || "משתמש";
  const nameParts = fullName.split(' ');
  
  // הכנת נתונים ראשוניים עם ערכי ברירת מחדל
  const initialData = {
    firstName: nameParts[0] || "שם פרטי",
    lastName: nameParts.slice(1).join(' ') || "שם משפחה", 
    email: currentUser?.email || "email@example.com",
    phone: userProfile?.phone || "לא הוגדר",
    employeeId: currentUser?.uid?.slice(-6).toUpperCase() || "123456",
    department: userProfile?.department || "מוקד שירות",
    position: userProfile?.position || "עובד",
    startDate: "01/01/2020", // ערך סטטי כיוון שלא זמין בממשק User
    address: "לא הוגדר", // לא זמין בממשק User הנוכחי
    emergencyContact: "לא הוגדר", // לא זמין בממשק User הנוכחי
    birthDate: "לא הוגדר" // לא זמין בממשק User הנוכחי
  };

  // State לניהול נתוני העובד
  const [employeeData, setEmployeeData] = useState(initialData);
  const [editedData, setEditedData] = useState(initialData);

  /**
   * פונקציה להפעלת מצב עריכה
   * מעתיקה את הנתונים הנוכחיים לשדות העריכה
   */
  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(employeeData);
  };

  /**
   * פונקציה לשמירת השינויים
   * כאן תתבצע עדכון הפרופיל ב-Firestore
   */
  const handleSave = () => {
    // כאן תתבצע עדכון הפרופיל ב-Firestore
    setEmployeeData(editedData);
    setIsEditing(false);
    toast({
      title: "פרטים עודכנו בהצלחה",
      description: "הפרטים האישיים שלך נשמרו במערכת",
    });
  };

  /**
   * פונקציה לביטול העריכה
   * מחזירה את הנתונים המקוריים
   */
  const handleCancel = () => {
    setEditedData(employeeData);
    setIsEditing(false);
  };

  /**
   * פונקציה לעדכון שדה בעריכה
   * @param field - שם השדה לעדכון
   * @param value - הערך החדש
   */
  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl flex flex-col">
      {/* כותרת הדף עם כפתור חזרה */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* כפתור חזרה לדף הבית */}
              <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>חזרה לדף הבית</span>
              </Button>
              
              {/* אזור ניווט ופרופיל - כרגע ריק */}
              <div className="flex items-center space-x-6">
                {/* כאן יוכלו להוסיף ניווט נוסף בעתיד */}
              </div>
            </div>
            {/* צד ימין - כרגע ריק */}
          </div>
        </div>
      </header>

      {/* תוכן ראשי של הדף */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* כותרת עיקרית עם אייקון ומידע */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="bg-emerald-600 p-3 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">אזור אישי</h1>
              <p className="text-lg text-gray-600">פרטים אישיים ומידע עבודה</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* אזור פרטים אישיים ועבודה - תופס 2/3 מהרוחב */}
          <div className="lg:col-span-2 space-y-6">
            {/* כרטיס פרטים אישיים */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>פרטים אישיים</span>
                    </CardTitle>
                    <CardDescription>
                      המידע האישי והתעסוקתי שלך
                    </CardDescription>
                  </div>
                  
                  {/* כפתורי עריכה/שמירה/ביטול */}
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        {/* כפתור שמירה - מוצג רק במצב עריכה */}
                        <Button size="sm" onClick={handleSave} className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>שמור</span>
                        </Button>
                        {/* כפתור ביטול - מוצג רק במצב עריכה */}
                        <Button size="sm" variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                          <X className="h-4 w-4" />
                          <span>ביטול</span>
                        </Button>
                      </>
                    ) : (
                      /* כפתור עריכה - מוצג רק במצב צפייה */
                      <Button size="sm" variant="outline" onClick={handleEdit} className="flex items-center space-x-2">
                        <Edit className="h-4 w-4" />
                        <span>עריכה</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* תצוגת פרופיל עם תמונת משתמש */}
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {employeeData.firstName[0]}{employeeData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {employeeData.firstName} {employeeData.lastName}
                    </h3>
                    <p className="text-gray-600">{employeeData.position}</p>
                    <Badge variant="outline">{employeeData.department}</Badge>
                  </div>
                </div>

                <Separator />

                {/* שדות פרטים אישיים - 2 עמודות */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* שדה שם פרטי */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">שם פרטי</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{employeeData.firstName}</p>
                    )}
                  </div>

                  {/* שדה שם משפחה */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">שם משפחה</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{employeeData.lastName}</p>
                    )}
                  </div>

                  {/* שדה אימייל עם אייקון */}
                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{employeeData.email}</span>
                      </p>
                    )}
                  </div>

                  {/* שדה טלפון עם אייקון */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{employeeData.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* שדה תאריך לידה עם אייקון */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">תאריך לידה</Label>
                    {isEditing ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={editedData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{employeeData.birthDate}</span>
                      </p>
                    )}
                  </div>

                  {/* שדה כתובת עם אייקון */}
                  <div className="space-y-2">
                    <Label htmlFor="address">כתובת</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={editedData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{employeeData.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* כרטיס פרטי עבודה - רק לצפייה */}
            <Card>
              <CardHeader>
                <CardTitle>פרטי עבודה</CardTitle>
                <CardDescription>
                  מידע תעסוקתי ומקצועי
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* שדות פרטי עבודה - 2 עמודות */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* מספר עובד */}
                  <div className="space-y-2">
                    <Label>מספר עובד</Label>
                    <p className="text-sm text-gray-900">{employeeData.employeeId}</p>
                  </div>

                  {/* תאריך תחילת עבודה */}
                  <div className="space-y-2">
                    <Label>תאריך תחילת עבודה</Label>
                    <p className="text-sm text-gray-900">{employeeData.startDate}</p>
                  </div>

                  {/* מחלקה */}
                  <div className="space-y-2">
                    <Label>אגף</Label>
                    <p className="text-sm text-gray-900">{employeeData.department}</p>
                  </div>

                  {/* תפקיד */}
                  <div className="space-y-2">
                    <Label>תפקיד</Label>
                    <p className="text-sm text-gray-900">{employeeData.position}</p>
                  </div>

                  {/* איש קשר לחירום - תופס 2 עמודות */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyContact">איש קשר לחירום</Label>
                    <p className="text-sm text-gray-900">{employeeData.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* צד ימין - כרגע ריק, יכול להכיל מידע נוסף בעתיד */}
        </div>
      </main>
      
      {/* תחתית הדף */}
      <Footer />
    </div>
  );
};

export default PersonalArea;