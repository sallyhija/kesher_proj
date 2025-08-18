import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  X, 
  AlertTriangle,
  ArrowRight,
  Filter
} from "lucide-react";
import { useSchedules } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";


interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

interface CalendarViewProps {
  onBack: () => void;
}

const CalendarView = ({ onBack }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedShift, setSelectedShift] = useState<ShiftEvent | null>(null);
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [showEditShiftDialog, setShowEditShiftDialog] = useState(false);

  const { currentUser } = useAuth();
  const { data: schedules, loading, error } = useSchedules();
  
  // Convert Firestore schedules to ShiftEvent format
  const shiftEvents: ShiftEvent[] = useMemo(() => {
    return schedules
      .filter((schedule: any) => schedule.userId === currentUser?.uid)
      .map((schedule: any) => ({
        id: schedule.id || '',
        title: `${schedule.shiftType === 'morning' ? 'בוקר' : schedule.shiftType === 'afternoon' ? 'אחר צהריים' : 'לילה'} - ${schedule.startTime}-${schedule.endTime}`,
        start: schedule.date?.toDate() || new Date(),
        end: schedule.date?.toDate() || new Date(),
        type: schedule.shiftType || 'morning',
        status: schedule.status || 'scheduled',
        location: schedule.location || 'משרד ראשי',
        notes: schedule.notes || ''
      }));
  }, [schedules, currentUser?.uid]);

  // Calendar logic
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => i + 1);

  // Sample shifts data for demonstration
  const shifts = [
    {
      id: '1',
      date: '2024-03-15',
      dayName: 'יום שישי',
      time: '08:00-16:00',
      type: 'morning',
      status: 'confirmed',
      location: 'משרד ראשי'
    },
    {
      id: '2',
      date: '2024-03-18',
      dayName: 'יום שני',
      time: '16:00-00:00',
      type: 'afternoon',
      status: 'pending',
      location: 'משרד ראשי'
    },
    {
      id: '3',
      date: '2024-03-20',
      dayName: 'יום רביעי',
      time: '08:00-16:00',
      type: 'morning',
      status: 'confirmed',
      location: 'משרד ראשי'
    }
  ];

  const getShiftForDay = (day: number) => {
    const dateString = `2024-03-${day.toString().padStart(2, '0')}`;
    return shifts.find(shift => shift.date === dateString);
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'morning': return 'bg-blue-100 text-blue-800';
      case 'afternoon': return 'bg-green-100 text-green-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <span>חזרה</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            סנן
          </Button>

        </div>
      </div>

      {/* כותרת עיקרית */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className="bg-emerald-600 p-3 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לוח השנה שלי</h1>
            <p className="text-lg text-gray-600">צפייה וניהול משמרות</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentMonth}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">חודש קודם</Button>
                  <Button variant="outline" size="sm">חודש הבא</Button>
                </div>
              </div>
              <CardDescription>
                לחץ על יום כדי לראות פרטי משמרת
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, index) => (
                  <div key={index} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} className="h-20"></div>
                ))}
                
                {/* Days of the month */}
                {daysInMonth.map((day) => {
                  const shift = getShiftForDay(day);
                  const dateString = `2024-03-${day.toString().padStart(2, '0')}`;
                  const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateString;
                  
                  return (
                    <div
                      key={day}
                      className={`h-20 border rounded-lg p-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                        isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedDate(new Date(2024, 2, day))}
                    >
                      <div className="text-sm font-medium mb-1">{day}</div>
                      {shift && (
                        <div className="space-y-1">
                          <div className={`text-xs px-1.5 py-0.5 rounded ${getShiftTypeColor(shift.type)}`}>
                            {shift.time.split('-')[0]}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            shift.status === 'confirmed' ? 'bg-green-500' :
                            shift.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Selected Day Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">פרטי היום הנבחר</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('he-IL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dateString = selectedDate.toISOString().split('T')[0];
                  const dayShift = shifts.find(s => s.date === dateString);
                  if (dayShift) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">משמרת:</span>
                          <Badge className={getShiftTypeColor(dayShift.type)}>
                            {dayShift.location}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">שעות:</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{dayShift.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">סטטוס:</span>
                          <Badge variant="outline" className={getStatusColor(dayShift.status)}>
                            {dayShift.status === 'confirmed' ? 'מאושר' : 
                             dayShift.status === 'pending' ? 'ממתין לאישור' : 'מבוטל'}
                          </Badge>
                        </div>

                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">אין משמרת מתוכננת ביום זה</p>

                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Shifts Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">המשמרות הקרובות</CardTitle>
              <CardDescription>5 המשמרות הבאות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shifts.slice(0, 5).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{shift.dayName}</p>
                      <p className="text-xs text-gray-600">{shift.time}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(shift.status)}>
                      {shift.status === 'confirmed' ? 'מאושר' : 
                       shift.status === 'pending' ? 'ממתין' : 'מבוטל'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">סטטיסטיקות החודש</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">סך שעות עבודה:</span>
                  <span className="font-medium">160 שעות</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">משמרות מאושרות:</span>
                  <span className="font-medium text-green-600">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ממתינות לאישור:</span>
                  <span className="font-medium text-yellow-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ימי חופש:</span>
                  <span className="font-medium text-blue-600">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
};

export default CalendarView;