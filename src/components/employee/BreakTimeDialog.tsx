import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Coffee } from "lucide-react";

interface BreakTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BreakTimeDialog = ({ open, onOpenChange }: BreakTimeDialogProps) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const breakTimes = [
    "10:00",
    "10:30", 
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30"
  ];

  const handleScheduleBreak = () => {
    if (selectedTime) {
      // TODO: Implement break scheduling logic
      console.log(`Break scheduled for ${selectedTime}`);
      onOpenChange(false);
      setSelectedTime(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Coffee className="h-5 w-5 text-orange-600" />
            בחר שעת הפסקה
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-right">
            בחר את השעה המועדפת עליך להפסקה (15 דקות)
          </p>
          
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {breakTimes.map((time) => (
              <Card 
                key={time}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTime === time 
                    ? 'ring-2 ring-orange-500 bg-orange-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                <CardContent className="p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium">{time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button 
              onClick={handleScheduleBreak}
              disabled={!selectedTime}
              className="bg-orange-600 hover:bg-orange-700"
            >
              קבע הפסקה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BreakTimeDialog;