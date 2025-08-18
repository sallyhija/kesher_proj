import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail, 
  Award, 
  AlertCircle, 
  Edit, 
  Trash, 
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUsers, useSchedules } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { User, Schedule } from "@/services/firestore";

interface StaffManagementProps {
  onBack: () => void;
}

const StaffManagement = ({ onBack }: StaffManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isGroupMessageDialogOpen, setIsGroupMessageDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [groupMessageText, setGroupMessageText] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [groupMessages, setGroupMessages] = useState<Array<{
    id: string;
    message: string;
    sentAt: Date;
    recipientCount: number;
    sender: string;
  }>>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "employee" as 'employee' | 'manager',
    phone: "",
    email: "",
    department: "",
    position: ""
  });
  const { toast } = useToast();
  const { data: users, loading, error, add, update, remove } = useUsers();
  const { data: schedules, loading: schedulesLoading, error: schedulesError } = useSchedules();
  const { currentUser } = useAuth();
  
  // Helper function to get current shift for a user
  const getCurrentShift = (userId: string): string => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const userSchedule = schedules.find((schedule: Schedule) => {
      const scheduleDate = schedule.date?.toDate();
      return schedule.userId === userId && 
             scheduleDate && 
             scheduleDate >= todayStart && 
             scheduleDate <= todayEnd && 
             schedule.status === 'confirmed';
    });
    
    if (userSchedule) {
      return `${userSchedule.startTime}-${userSchedule.endTime}`;
    }
    return 'לא מוקצה';
  };

  // Helper function to calculate performance based on completed schedules
  const calculatePerformance = (userId: string): number => {
    const userSchedules = schedules.filter((schedule: Schedule) => schedule.userId === userId);
    if (userSchedules.length === 0) return 0;
    
    const completedSchedules = userSchedules.filter(schedule => schedule.status === 'completed');
    const performancePercentage = (completedSchedules.length / userSchedules.length) * 100;
    
    return Math.round(performancePercentage);
  };

  // Convert Firestore users to staff data format
  const staffData = users
    .filter((user: User) => user.role === 'employee')
    .map((user: User) => ({
      id: user.id || '',
      name: user.name || 'Unknown',
      role: user.position || 'Employee',
      status: user.isActive ? 'פעיל' : 'לא פעיל',
      shift: getCurrentShift(user.id || ''),
      performance: calculatePerformance(user.id || ''),
      phone: user.phone || 'N/A',
      email: user.email || 'N/A',
      joinDate: user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('he-IL') : 'N/A',
      department: user.department || 'N/A',
      user: user // Keep reference to original user data
    }));

  const filteredStaff = staffData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "active") return matchesSearch && employee.status === "פעיל";
    if (filterType === "break") return matchesSearch && employee.status === "הפסקה";
    if (filterType === "inactive") return matchesSearch && employee.status === "לא פעיל";
    return matchesSearch;
  });



  const handleSendMessage = (employee: any) => {
    setSelectedEmployee(employee);
    setMessageText("");
    setIsMessageDialogOpen(true);
  };

  const handleSendMessageSubmit = async () => {
    if (!messageText.trim() || !selectedEmployee) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס הודעה",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically send the message to your messaging system
      // For now, we'll just show a success toast
      toast({
        title: "הודעה נשלחה",
        description: `הודעה נשלחה ל${selectedEmployee.name}`,
      });
      
      setMessageText("");
      setIsMessageDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשליחת ההודעה",
        variant: "destructive",
      });
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\-\+\(\)\s]+$/;
    return phoneRegex.test(phone) && phone.length >= 9;
  };

  const validateEmployeeData = (employee: typeof newEmployee): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!employee.name.trim()) {
      errors.push("שם העובד הוא שדה חובה");
    } else if (employee.name.trim().length < 2) {
      errors.push("שם העובד חייב להכיל לפחות 2 תווים");
    }

    if (!employee.email.trim()) {
      errors.push("כתובת אימייל היא שדה חובה");
    } else if (!validateEmail(employee.email)) {
      errors.push("כתובת אימייל לא תקינה");
    }

    if (!employee.phone.trim()) {
      errors.push("מספר טלפון הוא שדה חובה");
    } else if (!validatePhone(employee.phone)) {
      errors.push("מספר טלפון לא תקין");
    }

    if (!employee.position.trim()) {
      errors.push("תפקיד העובד הוא שדה חובה");
    }

    if (!employee.department.trim()) {
      errors.push("מחלקה היא שדה חובה");
    }

    // Check for duplicate email
    const existingUser = users.find((user: User) => user.email === employee.email);
    if (existingUser) {
      errors.push("כתובת אימייל זו כבר קיימת במערכת");
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleAddEmployee = async () => {
    const validation = validateEmployeeData(newEmployee);
    
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
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        department: newEmployee.department,
        position: newEmployee.position,
        phone: newEmployee.phone,
        avatar: "",
        isActive: true,
        createdAt: new Date() as any, // Will be set by Firestore
        updatedAt: new Date() as any
      });

      toast({
        title: "עובד נוסף בהצלחה",
        description: `${newEmployee.name} נוסף למערכת`,
      });
      
      setNewEmployee({
        name: "",
        role: "employee",
        phone: "",
        email: "",
        department: "",
        position: ""
      });
      setIsAddEmployeeDialogOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת העובד",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee.user);
    setIsEditEmployeeDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    try {
      await update(editingEmployee.id!, {
        name: editingEmployee.name,
        email: editingEmployee.email,
        role: editingEmployee.role,
        department: editingEmployee.department,
        position: editingEmployee.position,
        phone: editingEmployee.phone,
        isActive: editingEmployee.isActive,
        updatedAt: new Date() as any
      });

      toast({
        title: "עובד עודכן בהצלחה",
        description: `${editingEmployee.name} עודכן במערכת`,
      });
      
      setIsEditEmployeeDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון העובד",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employee: any) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${employee.name}?`)) {
      return;
    }

    try {
      await remove(employee.id);
      toast({
        title: "עובד נמחק בהצלחה",
        description: `${employee.name} נמחק מהמערכת`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת העובד",
        variant: "destructive",
      });
    }
  };

  const handleGroupMessage = () => {
    setGroupMessageText("");
    setIsGroupMessageDialogOpen(true);
  };

  const handleGroupMessageSubmit = async () => {
    if (!groupMessageText.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס הודעה",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all active employees
      const activeEmployees = staffData.filter(employee => employee.status === 'פעיל');
      
      if (activeEmployees.length === 0) {
        toast({
          title: "שגיאה",
          description: "אין עובדים פעילים במערכת",
          variant: "destructive",
        });
        return;
      }

             // Here you would typically send the message to all employees
       // For now, we'll show a success toast with the count
       
       // Add the message to the group messages list
       const newGroupMessage = {
         id: Date.now().toString(),
         message: groupMessageText,
         sentAt: new Date(),
         recipientCount: activeEmployees.length,
         sender: currentUser?.displayName || currentUser?.email || 'מנהל'
       };
       
       setGroupMessages(prev => [newGroupMessage, ...prev]);
       
       toast({
         title: "הודעה קבוצתית נשלחה",
         description: `הודעה נשלחה ל${activeEmployees.length} עובדים פעילים`,
       });
       
       setGroupMessageText("");
       setIsGroupMessageDialogOpen(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשליחת ההודעה הקבוצתית",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "שליחת הודעה קבוצתית") {
      handleGroupMessage();
    } else {
      toast({
        title: "פעולה בוצעה",
        description: `${action} בוצע בהצלחה`,
      });
    }
  };

  if (loading || schedulesLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתוני עובדים...</p>
        </div>
      </div>
    );
  }

  if (error || schedulesError) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת נתונים</h3>
          <p className="text-gray-600">{error?.message || schedulesError?.message}</p>
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
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">ניהול צוות מתקדם</h2>
            <p className="text-lg text-gray-600">ניהול מלא של העובדים, ביצועים ופרטים</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4" dir="ltr">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="details">פרטי עובדים</TabsTrigger>
          <TabsTrigger value="performance">ביצועים</TabsTrigger>
          <TabsTrigger value="actions">פעולות</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש עובדים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                                 <Button variant="outline">
                   סינון
                   <Filter className="h-4 w-4 mr-2" />
                 </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>סינון עובדים</DialogTitle>
                  <DialogDescription>בחר קריטריונים לסינון רשימת העובדים</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">סטטוס עובד</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סטטוס" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל העובדים</SelectItem>
                        <SelectItem value="active">פעילים</SelectItem>
                        <SelectItem value="break">בהפסקה</SelectItem>
                        <SelectItem value="inactive">לא פעילים</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
              <DialogTrigger asChild>
                                 <Button>
                   הוסף עובד
                   <Plus className="h-4 w-4 mr-2" />
                 </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>הוספת עובד חדש</DialogTitle>
                  <DialogDescription>הכנס את פרטי העובד החדש למערכת</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">שם מלא</label>
                    <Input 
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="הכנס שם מלא"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תפקיד</label>
                    <Select value={newEmployee.position} onValueChange={(value) => setNewEmployee({...newEmployee, position: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="נציג שירות">נציג שירות</SelectItem>
                        <SelectItem value="נציג בכיר">נציג בכיר</SelectItem>
                        <SelectItem value="מנהל צוות">מנהל צוות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">טלפון</label>
                    <Input 
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      placeholder="050-1234567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">אימייל</label>
                    <Input 
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="דוגמה@חברה.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">מחלקה</label>
                    <Input 
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      placeholder="שירות לקוחות"
                    />
                  </div>
                  <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
                      ביטול
                    </Button>
                    <Button onClick={handleAddEmployee}>
                      הוסף עובד
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredStaff.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-6">
                                         <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-reverse space-x-2">
                         <Badge 
                           variant="outline" 
                           className={employee.status === 'פעיל' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
                         >
                           {employee.status}
                         </Badge>
                         <div className="flex space-x-reverse space-x-1">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleSendMessage(employee)}
                           >
                             <Mail className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleEditEmployee(employee)}
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleDeleteEmployee(employee)}
                           >
                             <Trash className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                       <div className="flex items-center space-x-reverse space-x-4">
                         <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                           {employee.name ? employee.name[0] : '?'}
                         </div>
                         <div>
                           <h3 className="font-semibold text-lg">{employee.name}</h3>
                           <p className="text-muted-foreground">{employee.role}</p>
                           <div className="flex items-center space-x-reverse space-x-4 mt-2">
                             <span className="text-sm text-muted-foreground">
                               <MoreVertical className="h-3 w-3 inline ml-1" />
                               {employee.shift}
                             </span>
                             <span className="text-sm text-muted-foreground">
                               <MoreVertical className="h-3 w-3 inline ml-1" />
                               {employee.joinDate}
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditEmployeeDialogOpen} onOpenChange={setIsEditEmployeeDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>עריכת עובד</DialogTitle>
              <DialogDescription>עדכן את פרטי העובד</DialogDescription>
            </DialogHeader>
            {editingEmployee && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">שם מלא</label>
                  <Input 
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                    placeholder="הכנס שם מלא"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">תפקיד</label>
                  <Select value={editingEmployee.position || ''} onValueChange={(value) => setEditingEmployee({...editingEmployee, position: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר תפקיד" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="נציג שירות">נציג שירות</SelectItem>
                      <SelectItem value="נציג בכיר">נציג בכיר</SelectItem>
                      <SelectItem value="מנהל צוות">מנהל צוות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">טלפון</label>
                  <Input 
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                    placeholder="050-1234567"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">אימייל</label>
                  <Input 
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                    placeholder="דוגמה@חברה.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">מחלקה</label>
                  <Input 
                    value={editingEmployee.department || ''}
                    onChange={(e) => setEditingEmployee({...editingEmployee, department: e.target.value})}
                    placeholder="שירות לקוחות"
                  />
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingEmployee.isActive}
                    onChange={(e) => setEditingEmployee({...editingEmployee, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">פעיל</label>
                </div>
                <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditEmployeeDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleUpdateEmployee}>
                    עדכן עובד
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
                 </Dialog>

                   {/* Message Dialog */}
          <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>שליחת הודעה</DialogTitle>
                <DialogDescription>
                  שלח הודעה ל{selectedEmployee?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">הודעה</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="הכנס את תוכן ההודעה..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
                    dir="rtl"
                  />
                </div>
                <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleSendMessageSubmit}>
                    שלח הודעה
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Group Message Dialog */}
          <Dialog open={isGroupMessageDialogOpen} onOpenChange={setIsGroupMessageDialogOpen}>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>הודעה קבוצתית</DialogTitle>
                <DialogDescription>
                  שלח הודעה לכל העובדים הפעילים במערכת
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">הודעה</label>
                  <textarea
                    value={groupMessageText}
                    onChange={(e) => setGroupMessageText(e.target.value)}
                    placeholder="הכנס את תוכן ההודעה הקבוצתית..."
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none"
                    dir="rtl"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>שים לב:</strong> הודעה זו תישלח לכל העובדים הפעילים במערכת ({staffData.filter(employee => employee.status === 'פעיל').length} עובדים)
                  </p>
                </div>
                <div className="flex justify-end space-x-reverse space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsGroupMessageDialogOpen(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleGroupMessageSubmit}>
                    שלח הודעה קבוצתית
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

         {/* Additional tabs content would go here */}
                                   <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader dir="rtl">
                <CardTitle className="text-right">פרטי עובדים מפורטים</CardTitle>
                <CardDescription className="text-right">מידע מפורט על כל עובד במערכת</CardDescription>
              </CardHeader>
             <CardContent>
               {staffData.length === 0 ? (
                 <div className="text-center py-8 text-gray-500">
                   <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <p>אין עובדים במערכת</p>
                   <p className="text-sm">הוסף עובדים חדשים כדי לראות אותם כאן</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {staffData.map((employee) => (
                     <div key={employee.id} className="border rounded-lg p-6 bg-gray-50">
                       <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center space-x-reverse space-x-4">
                           <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                             {employee.name ? employee.name[0] : '?'}
                           </div>
                           <div>
                             <h3 className="text-xl font-bold">{employee.name}</h3>
                             <p className="text-lg text-muted-foreground">{employee.role}</p>
                             <Badge 
                               variant="outline" 
                               className={`mt-2 ${employee.status === 'פעיל' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                             >
                               {employee.status}
                             </Badge>
                           </div>
                         </div>
                         <div className="flex space-x-reverse space-x-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleSendMessage(employee)}
                           >
                             <Mail className="h-4 w-4 ml-2" />
                             שלח הודעה
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleEditEmployee(employee)}
                           >
                             <Edit className="h-4 w-4 ml-2" />
                             ערוך
                           </Button>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-2">פרטי אישיים</h4>
                             <div className="space-y-2">
                               <div className="flex justify-between">
                                 <span className="text-gray-600">שם מלא:</span>
                                 <span className="font-medium">{employee.name}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">תפקיד:</span>
                                 <span className="font-medium">{employee.role}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">מחלקה:</span>
                                 <span className="font-medium">{employee.department}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">סטטוס:</span>
                                 <Badge 
                                   variant="outline" 
                                   className={employee.status === 'פעיל' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
                                 >
                                   {employee.status}
                                 </Badge>
                               </div>
                             </div>
                           </div>
                           
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-2">פרטי קשר</h4>
                             <div className="space-y-2">
                               <div className="flex justify-between">
                                 <span className="text-gray-600">אימייל:</span>
                                 <span className="font-medium">{employee.email}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">טלפון:</span>
                                 <span className="font-medium">{employee.phone}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                         
                         <div className="space-y-4">
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-2">פרטי עבודה</h4>
                             <div className="space-y-2">
                               <div className="flex justify-between">
                                 <span className="text-gray-600">משמרת נוכחית:</span>
                                 <span className="font-medium">{employee.shift}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">תאריך הצטרפות:</span>
                                 <span className="font-medium">{employee.joinDate}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">ביצועים:</span>
                                 <div className="flex items-center space-x-reverse space-x-2">
                                   <div className="w-16 bg-gray-200 rounded-full h-2">
                                     <div 
                                       className="bg-primary h-2 rounded-full" 
                                       style={{ width: `${employee.performance}%` }}
                                     ></div>
                                   </div>
                                   <span className="font-medium">{employee.performance}%</span>
                                 </div>
                               </div>
                             </div>
                           </div>
                           
                           <div>
                             <h4 className="font-semibold text-gray-900 mb-2">סטטיסטיקות</h4>
                             <div className="space-y-2">
                               <div className="flex justify-between">
                                 <span className="text-gray-600">מזהה עובד:</span>
                                 <span className="font-mono text-sm">{employee.id}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">תאריך עדכון אחרון:</span>
                                 <span className="font-medium">
                                   {employee.user.updatedAt ? 
                                     new Date(employee.user.updatedAt.toDate()).toLocaleDateString('he-IL') : 
                                     'לא זמין'
                                   }
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="mt-6 pt-4 border-t">
                         <div className="flex justify-between items-center">
                           <div className="text-sm text-gray-500">
                             עובד {employee.status === 'פעיל' ? 'פעיל' : 'לא פעיל'} במערכת
                           </div>
                           <Button
                             size="sm"
                             variant="destructive"
                             onClick={() => handleDeleteEmployee(employee)}
                           >
                             <Trash className="h-4 w-4 ml-2" />
                             מחק עובד
                           </Button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>

                 <TabsContent value="performance" className="space-y-6">
           {/* Performance Overview Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center space-x-reverse space-x-4">
                   <div className="bg-green-100 p-3 rounded-lg">
                     <Users className="h-6 w-6 text-green-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-600">סה"כ עובדים</p>
                     <p className="text-2xl font-bold">{staffData.length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center space-x-reverse space-x-4">
                   <div className="bg-blue-100 p-3 rounded-lg">
                     <Users className="h-6 w-6 text-blue-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-600">עובדים פעילים</p>
                     <p className="text-2xl font-bold">{staffData.filter(e => e.status === 'פעיל').length}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center space-x-reverse space-x-4">
                   <div className="bg-yellow-100 p-3 rounded-lg">
                     <Award className="h-6 w-6 text-yellow-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-600">ביצועים ממוצעים</p>
                     <p className="text-2xl font-bold">
                       {staffData.length > 0 
                         ? Math.round(staffData.reduce((sum, e) => sum + e.performance, 0) / staffData.length)
                         : 0}%
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             
             <Card>
               <CardContent className="p-6">
                 <div className="flex items-center space-x-reverse space-x-4">
                   <div className="bg-purple-100 p-3 rounded-lg">
                     <Award className="h-6 w-6 text-purple-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-600">עובדים מצטיינים</p>
                     <p className="text-2xl font-bold">
                       {staffData.filter(e => e.performance >= 90).length}
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Performance Charts and Analytics */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           {/* Performance Distribution */}
              <Card>
                <CardHeader dir="rtl">
                  <CardTitle className="text-right">התפלגות ביצועים</CardTitle>
                  <CardDescription className="text-right">חלוקת העובדים לפי רמת ביצועים</CardDescription>
                </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">מצטיינים (90%+)</span>
                     <div className="flex items-center space-x-reverse space-x-2">
                       <div className="w-24 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-green-500 h-2 rounded-full" 
                           style={{ 
                             width: `${staffData.length > 0 ? (staffData.filter(e => e.performance >= 90).length / staffData.length) * 100 : 0}%` 
                           }}
                         ></div>
                       </div>
                       <span className="text-sm font-medium w-8 text-right">
                         {staffData.filter(e => e.performance >= 90).length}
                       </span>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">טובים (70-89%)</span>
                     <div className="flex items-center space-x-reverse space-x-2">
                       <div className="w-24 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-blue-500 h-2 rounded-full" 
                           style={{ 
                             width: `${staffData.length > 0 ? (staffData.filter(e => e.performance >= 70 && e.performance < 90).length / staffData.length) * 100 : 0}%` 
                           }}
                         ></div>
                       </div>
                       <span className="text-sm font-medium w-8 text-right">
                         {staffData.filter(e => e.performance >= 70 && e.performance < 90).length}
                       </span>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">ממוצעים (50-69%)</span>
                     <div className="flex items-center space-x-reverse space-x-2">
                       <div className="w-24 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-yellow-500 h-2 rounded-full" 
                           style={{ 
                             width: `${staffData.length > 0 ? (staffData.filter(e => e.performance >= 50 && e.performance < 70).length / staffData.length) * 100 : 0}%` 
                           }}
                         ></div>
                       </div>
                       <span className="text-sm font-medium w-8 text-right">
                         {staffData.filter(e => e.performance >= 50 && e.performance < 70).length}
                       </span>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">נמוכים (מתחת ל-50%)</span>
                     <div className="flex items-center space-x-reverse space-x-2">
                       <div className="w-24 bg-gray-200 rounded-full h-2">
                         <div 
                           className="bg-red-500 h-2 rounded-full" 
                           style={{ 
                             width: `${staffData.length > 0 ? (staffData.filter(e => e.performance < 50).length / staffData.length) * 100 : 0}%` 
                           }}
                         ></div>
                       </div>
                       <span className="text-sm font-medium w-8 text-right">
                         {staffData.filter(e => e.performance < 50).length}
                       </span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

                           {/* Department Performance */}
              <Card>
                <CardHeader dir="rtl">
                  <CardTitle className="text-right">ביצועים לפי מחלקה</CardTitle>
                  <CardDescription className="text-right">ממוצע ביצועים לכל מחלקה</CardDescription>
                </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {(() => {
                     const departments = [...new Set(staffData.map(e => e.department))];
                     const departmentStats = departments.map(dept => {
                       const deptEmployees = staffData.filter(e => e.department === dept);
                       const avgPerformance = deptEmployees.length > 0 
                         ? Math.round(deptEmployees.reduce((sum, e) => sum + e.performance, 0) / deptEmployees.length)
                         : 0;
                       return { department: dept, avgPerformance, employeeCount: deptEmployees.length };
                     });
                     
                     return departmentStats.map((dept, index) => (
                       <div key={index} className="flex items-center justify-between">
                         <div>
                           <span className="text-sm font-medium">{dept.department}</span>
                           <p className="text-xs text-gray-500">{dept.employeeCount} עובדים</p>
                         </div>
                         <div className="flex items-center space-x-reverse space-x-2">
                           <div className="w-20 bg-gray-200 rounded-full h-2">
                             <div 
                               className={`h-2 rounded-full ${
                                 dept.avgPerformance >= 90 ? 'bg-green-500' :
                                 dept.avgPerformance >= 70 ? 'bg-blue-500' :
                                 dept.avgPerformance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                               }`}
                               style={{ width: `${dept.avgPerformance}%` }}
                             ></div>
                           </div>
                           <span className="text-sm font-medium w-8 text-right">{dept.avgPerformance}%</span>
                         </div>
                       </div>
                     ));
                   })()}
                 </div>
               </CardContent>
             </Card>
           </div>

                       {/* Top Performers */}
            <Card>
              <CardHeader dir="rtl">
                <CardTitle className="text-right">עובדים מצטיינים</CardTitle>
                <CardDescription className="text-right">העובדים עם הביצועים הגבוהים ביותר</CardDescription>
              </CardHeader>
             <CardContent>
               {staffData.length === 0 ? (
                 <div className="text-center py-8 text-gray-500">
                   <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <p>אין עובדים במערכת</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {staffData
                     .sort((a, b) => b.performance - a.performance)
                     .slice(0, 5)
                     .map((employee, index) => (
                       <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                         <div className="flex items-center space-x-reverse space-x-4">
                           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                             {index + 1}
                           </div>
                           <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                             {employee.name ? employee.name[0] : '?'}
                           </div>
                           <div>
                             <h4 className="font-semibold">{employee.name}</h4>
                             <p className="text-sm text-gray-600">{employee.role} - {employee.department}</p>
                           </div>
                         </div>
                         <div className="flex items-center space-x-reverse space-x-4">
                           <div className="text-right">
                             <p className="text-lg font-bold text-green-600">{employee.performance}%</p>
                             <p className="text-xs text-gray-500">ביצועים</p>
                           </div>
                           <Badge 
                             variant="outline" 
                             className={employee.status === 'פעיל' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
                           >
                             {employee.status}
                           </Badge>
                         </div>
                       </div>
                     ))}
                 </div>
               )}
             </CardContent>
           </Card>

                       {/* Performance Improvement Needed */}
            <Card>
              <CardHeader dir="rtl">
                <CardTitle className="text-right">עובדים הזקוקים לשיפור</CardTitle>
                <CardDescription className="text-right">עובדים עם ביצועים נמוכים מ-70%</CardDescription>
              </CardHeader>
             <CardContent>
               {(() => {
                 const lowPerformers = staffData.filter(e => e.performance < 70).sort((a, b) => a.performance - b.performance);
                 
                 if (lowPerformers.length === 0) {
                   return (
                     <div className="text-center py-8 text-gray-500">
                       <Award className="h-12 w-12 mx-auto mb-4 text-green-300" />
                       <p>כל העובדים מציגים ביצועים טובים!</p>
                       <p className="text-sm">אין עובדים הזקוקים לשיפור מיידי</p>
                     </div>
                   );
                 }
                 
                 return (
                   <div className="space-y-4">
                     {lowPerformers.map((employee) => (
                       <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                         <div className="flex items-center space-x-reverse space-x-4">
                           <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                             {employee.name ? employee.name[0] : '?'}
                           </div>
                           <div>
                             <h4 className="font-semibold">{employee.name}</h4>
                             <p className="text-sm text-gray-600">{employee.role} - {employee.department}</p>
                           </div>
                         </div>
                         <div className="flex items-center space-x-reverse space-x-4">
                           <div className="text-right">
                             <p className="text-lg font-bold text-red-600">{employee.performance}%</p>
                             <p className="text-xs text-gray-500">ביצועים</p>
                           </div>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleSendMessage(employee)}
                           >
                             <Mail className="h-4 w-4 ml-2" />
                             שלח משוב
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 );
               })()}
             </CardContent>
           </Card>

                       {/* Performance Trends */}
            <Card>
              <CardHeader dir="rtl">
                <CardTitle className="text-right">מגמות ביצועים</CardTitle>
                <CardDescription className="text-right">סטטיסטיקות ביצועים שבועיות וחודשיות</CardDescription>
              </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="text-center p-4 border rounded-lg">
                   <p className="text-sm text-gray-600">ביצועים השבוע</p>
                   <p className="text-2xl font-bold text-blue-600">
                     {staffData.length > 0 
                       ? Math.round(staffData.reduce((sum, e) => sum + e.performance, 0) / staffData.length)
                       : 0}%
                   </p>
                   <p className="text-xs text-gray-500">ממוצע כללי</p>
                 </div>
                 
                 <div className="text-center p-4 border rounded-lg">
                   <p className="text-sm text-gray-600">עובדים פעילים</p>
                   <p className="text-2xl font-bold text-green-600">
                     {staffData.filter(e => e.status === 'פעיל').length}
                   </p>
                   <p className="text-xs text-gray-500">מתוך {staffData.length} עובדים</p>
                 </div>
                 
                 <div className="text-center p-4 border rounded-lg">
                   <p className="text-sm text-gray-600">שיעור הצלחה</p>
                   <p className="text-2xl font-bold text-purple-600">
                     {staffData.length > 0 
                       ? Math.round((staffData.filter(e => e.performance >= 70).length / staffData.length) * 100)
                       : 0}%
                   </p>
                   <p className="text-xs text-gray-500">עובדים עם ביצועים טובים</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>

                 <TabsContent value="actions" className="space-y-6">
                       <Card>
              <CardHeader dir="rtl">
                <CardTitle className="text-right">פעולות מהירות</CardTitle>
                <CardDescription className="text-right">פעולות נפוצות לניהול צוות</CardDescription>
              </CardHeader>
             <CardContent>
                               <div className="flex justify-center">
                                   <Button onClick={() => handleQuickAction("שליחת הודעה קבוצתית")}>
                     הודעה קבוצתית
                     <Mail className="h-4 w-4 mr-2" />
                   </Button>
                </div>
             </CardContent>
           </Card>

           {/* Group Messages History */}
           <Card>
             <CardHeader dir="rtl">
               <CardTitle className="text-right">הודעות קבוצתיות קודמות</CardTitle>
               <CardDescription className="text-right">היסטוריית הודעות קבוצתיות שנשלחו</CardDescription>
             </CardHeader>
             <CardContent>
               {groupMessages.length === 0 ? (
                 <div className="text-center py-8 text-gray-500">
                   <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <p>אין הודעות קבוצתיות קודמות</p>
                   <p className="text-sm">הודעות קבוצתיות שתשלח יופיעו כאן</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {groupMessages.map((message) => (
                     <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
                       <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center space-x-reverse space-x-2">
                           <Badge variant="outline" className="text-xs">
                             {message.recipientCount} נמענים
                           </Badge>
                           <span className="text-sm text-gray-600">
                             נשלח על ידי: {message.sender}
                           </span>
                         </div>
                         <span className="text-xs text-gray-500">
                           {message.sentAt.toLocaleDateString('he-IL')} {message.sentAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       <div className="bg-white p-3 rounded border">
                         <p className="text-sm" dir="rtl">{message.message}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;