import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { swapOfferService } from "@/services/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/firestore";
import { Timestamp } from "firebase/firestore";

interface CreateSwapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwapCreated?: () => void;
}

const CreateSwapDialog = ({ open, onOpenChange, onSwapCreated }: CreateSwapDialogProps) => {
  // Current shift selection
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  
  // Desired shift selection (from available schedule options)
  const [desiredScheduleId, setDesiredScheduleId] = useState<string>("");

  // Other details
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  
  // State for schedules
  const [userSchedules, setUserSchedules] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState<Error | null>(null);
  
  // Fetch schedules (next 30 days)
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!currentUser?.uid || !open) return;
      
      setSchedulesLoading(true);
      setSchedulesError(null);
      
      try {
        // Use simple getAll query instead of real-time listener
        const allScheduleData = await scheduleService.getAll();
        
        // Filter client-side instead of using complex Firestore queries
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);
        
        // Filter for current user's schedules (for current shift selection)
        const currentUserSchedules = allScheduleData.filter(schedule => {
          const scheduleDate = schedule.date.toDate();
          return (
            schedule.userId === currentUser.uid &&
            scheduleDate >= today &&
            scheduleDate <= futureDate &&
            (schedule.status === 'scheduled' || schedule.status === 'confirmed')
          );
        });
        
        // Filter all schedules for desired shift options (excluding current user)
        const otherSchedules = allScheduleData.filter(schedule => {
          const scheduleDate = schedule.date.toDate();
          return (
            schedule.userId !== currentUser.uid &&
            scheduleDate >= today &&
            scheduleDate <= futureDate &&
            (schedule.status === 'scheduled' || schedule.status === 'confirmed')
          );
        });
        
        console.log('User schedules loaded:', currentUserSchedules.length);
        console.log('Other schedules loaded:', otherSchedules.length);
        
        setUserSchedules(currentUserSchedules);
        setAllSchedules(otherSchedules);
      } catch (error) {
        console.error('Schedules error:', error);
        setSchedulesError(error as Error);
      } finally {
        setSchedulesLoading(false);
      }
    };
    
    fetchSchedules();
  }, [currentUser?.uid, open]);
  
  // Sort the schedules by date (filtering already done in useEffect)
  const availableUserSchedules = userSchedules.sort((a, b) => 
    a.date.toDate().getTime() - b.date.toDate().getTime()
  );
  
  const availableDesiredSchedules = allSchedules.sort((a, b) => 
    a.date.toDate().getTime() - b.date.toDate().getTime()
  );
  
  // Find selected schedule details
  const selectedSchedule = availableUserSchedules.find(s => s.id === selectedScheduleId);
  const selectedDesiredSchedule = availableDesiredSchedules.find(s => s.id === desiredScheduleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid || !userProfile) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר למערכת",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!selectedScheduleId || !selectedSchedule || !desiredScheduleId || !selectedDesiredSchedule || !reason.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate expiry date (always 1 day)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);

      await swapOfferService.add({
        employeeId: currentUser.uid,
        employeeName: userProfile.name,
        employeeDepartment: userProfile.department || 'לא צוין',
        employeeRating: 4.5, // Default rating - could be calculated from past swaps
        employeeCompletedSwaps: 0, // Default - could be calculated from past swaps
        currentShift: {
          scheduleId: selectedSchedule.id,
          date: selectedSchedule.date,
          startTime: selectedSchedule.startTime,
          endTime: selectedSchedule.endTime,
          shiftType: selectedSchedule.shiftType,
          location: 'משרד ראשי', // Default location - could be added to schedule model
        },
        desiredShift: {
          scheduleId: selectedDesiredSchedule.id,
          date: selectedDesiredSchedule.date,
          startTime: selectedDesiredSchedule.startTime,
          endTime: selectedDesiredSchedule.endTime,
          shiftType: selectedDesiredSchedule.shiftType,
          location: 'משרד ראשי', // Default location - could be added to schedule model
        },
        reason: reason.trim(),
        status: 'active',
        expiresAt: Timestamp.fromDate(expiryDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "הצעת החלפה נוצרה",
        description: "ההצעה פורסמה בהצלחה בשוק החלפות",
      });

      // Reset form
      setSelectedScheduleId("");
      setDesiredScheduleId("");
      setReason("");

      onSwapCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating swap offer:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת ההצעה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5 text-emerald-600" />
            <span>יצירת הצעת החלפת משמרת</span>
          </DialogTitle>
          <DialogDescription>
            מלא את הפרטים להצעת החלפת המשמרת שלך
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Shift Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-800 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>בחר את המשמרת שברצונך להחליף</span>
            </h3>
            
            {schedulesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">טוען משמרות...</p>
              </div>
            ) : schedulesError ? (
              <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800">שגיאה בטעינת המשמרות</p>
                <p className="text-sm text-red-600 mb-3">לא ניתן לטעון את המשמרות מהמערכת כרגע</p>
                <p className="text-xs text-red-500 mb-3">אנא נסה שוב מאוחר יותר או פנה למנהל המערכת</p>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    נסה שוב
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    סגור
                  </Button>
                </div>
              </div>
            ) : availableUserSchedules.length === 0 ? (
              <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">אין משמרות זמינות להחלפה</p>
                <p className="text-sm text-yellow-600 mb-3">נא פנה למנהל לקביעת משמרות</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      // Create a sample schedule for testing
                      const { scheduleService } = await import('@/services/firestore');
                      const { Timestamp } = await import('firebase/firestore');
                      
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      
                      await scheduleService.add({
                        userId: currentUser?.uid || '',
                        userName: userProfile?.name || 'Test User',
                        date: Timestamp.fromDate(tomorrow),
                        startTime: '08:00',
                        endTime: '16:00',
                        shiftType: 'morning',
                        status: 'scheduled',
                        notes: 'משמרת דוגמה'
                      });
                      
                      toast({
                        title: "משמרת דוגמה נוצרה",
                        description: "נוצרה משמרת דוגמה לבדיקה",
                      });
                      
                      // Refresh the schedules data
                      const allScheduleData = await scheduleService.getAll();
                      const today = new Date();
                      const futureDate = new Date();
                      futureDate.setDate(today.getDate() + 30);
                      
                      const currentUserSchedules = allScheduleData.filter(schedule => {
                        const scheduleDate = schedule.date.toDate();
                        return (
                          schedule.userId === currentUser?.uid &&
                          scheduleDate >= today &&
                          scheduleDate <= futureDate &&
                          (schedule.status === 'scheduled' || schedule.status === 'confirmed')
                        );
                      });
                      
                      const otherSchedules = allScheduleData.filter(schedule => {
                        const scheduleDate = schedule.date.toDate();
                        return (
                          schedule.userId !== currentUser?.uid &&
                          scheduleDate >= today &&
                          scheduleDate <= futureDate &&
                          (schedule.status === 'scheduled' || schedule.status === 'confirmed')
                        );
                      });
                      
                      setUserSchedules(currentUserSchedules);
                      setAllSchedules(otherSchedules);
                    } catch (error) {
                      console.error('Error creating sample schedule:', error);
                      toast({
                        title: "שגיאה",
                        description: "לא ניתן ליצור משמרת דוגמה",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  צור משמרת דוגמה
                </Button>
              </div>
            ) : (
              <div>
                <Label htmlFor="current-schedule">בחר משמרת</Label>
                <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר משמרת להחלפה" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUserSchedules.map((schedule) => {
                      const date = schedule.date.toDate();
                      const dateStr = date.toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      const shiftTypeText = 
                        schedule.shiftType === 'morning' ? 'בוקר' :
                        schedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה';
                      
                      return (
                        <SelectItem key={schedule.id} value={schedule.id!}>
                          {dateStr} - {shiftTypeText} ({schedule.startTime}-{schedule.endTime})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {selectedSchedule && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">פרטי המשמרת הנבחרת:</h4>
                    <div className="text-sm text-red-700 space-y-1">
                      <p><strong>תאריך:</strong> {selectedSchedule.date.toDate().toLocaleDateString('he-IL')}</p>
                      <p><strong>שעות:</strong> {selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
                      <p><strong>סוג:</strong> {
                        selectedSchedule.shiftType === 'morning' ? 'בוקר' :
                        selectedSchedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה'
                      }</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desired Shift Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>בחר את המשמרת הרצויה</span>
            </h3>
            
            {availableDesiredSchedules.length === 0 ? (
              <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">אין משמרות זמינות לבחירה</p>
                <p className="text-sm text-yellow-600">נא צור משמרות נוספות או נסה שוב מאוחר יותר</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="desired-schedule">בחר משמרת רצויה</Label>
                <Select value={desiredScheduleId} onValueChange={setDesiredScheduleId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר משמרת רצויה" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDesiredSchedules.map((schedule) => {
                      const date = schedule.date.toDate();
                      const dateStr = date.toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      const shiftTypeText = 
                        schedule.shiftType === 'morning' ? 'בוקר' :
                        schedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה';
                      
                      return (
                        <SelectItem key={schedule.id} value={schedule.id!}>
                          {dateStr} - {shiftTypeText} ({schedule.startTime}-{schedule.endTime}) - {schedule.userName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {selectedDesiredSchedule && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">פרטי המשמרת הרצויה:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>תאריך:</strong> {selectedDesiredSchedule.date.toDate().toLocaleDateString('he-IL')}</p>
                      <p><strong>שעות:</strong> {selectedDesiredSchedule.startTime} - {selectedDesiredSchedule.endTime}</p>
                      <p><strong>סוג:</strong> {
                        selectedDesiredSchedule.shiftType === 'morning' ? 'בוקר' :
                        selectedDesiredSchedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה'
                      }</p>
                      <p><strong>עובד:</strong> {selectedDesiredSchedule.userName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">סיבת החלפה</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="הסבר מדוע אתה מעוניין להחליף משמרת..."
                required
                className="min-h-[80px]"
              />
            </div>
            
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p><strong>תוקף ההצעה:</strong> 24 שעות מרגע הפרסום</p>
              <p className="text-xs text-blue-600 mt-1">ההצעה תפוג אוטומטית אחרי יום אחד</p>
            </div>
          </div>
        </form>

        <DialogFooter className="flex space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || availableUserSchedules.length === 0 || !selectedScheduleId || !desiredScheduleId}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? "יוצר הצעה..." : 
             availableUserSchedules.length === 0 ? "אין משמרות זמינות" :
             !selectedScheduleId ? "בחר משמרת נוכחית" :
             !desiredScheduleId ? "בחר משמרת רצויה" : "פרסם הצעה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSwapDialog;
