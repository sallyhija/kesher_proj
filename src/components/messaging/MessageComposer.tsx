
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface MessageComposerProps {
  employees: Employee[];
  onSendMessage: (message: { 
    content: string; 
    type: 'regular' | 'holiday' | 'birthday';
    recipients?: string[];
    subject?: string;
  }) => void;
  onBack?: () => void;
  templateData?: {
    subject: string;
    content: string;
    type: 'regular' | 'holiday' | 'birthday';
  } | null;
  onTemplateApplied?: () => void;
}

const MessageComposer = ({ employees, onSendMessage, onBack, templateData, onTemplateApplied }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const messageType = 'regular'; // Fixed to regular messages only
  const [selectedManager, setSelectedManager] = useState<string>("");
  const { toast } = useToast();

  // Apply template data when it changes
  React.useEffect(() => {
    if (templateData) {
      setSubject(templateData.subject);
      setMessage(templateData.content);
      // Note: messageType is now fixed to 'regular'
      onTemplateApplied?.();
    }
  }, [templateData, onTemplateApplied]);

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין תוכן הודעה",
        variant: "destructive",
      });
      return;
    }

    if (!selectedManager) {
      toast({
        title: "שגיאה",
        description: "נא לבחור מנהל",
        variant: "destructive",
      });
      return;
    }

    const recipients = [selectedManager];

    onSendMessage({ 
      content: message, 
      type: messageType,
      recipients: recipients,
      subject: subject || "הודעה חדשה"
    });
    
    // Reset form
    setMessage("");
    setSubject("");
    setSelectedManager("");
  };

  // Message type is now fixed to 'regular'

  const selectedManagerName = employees.find(emp => emp.id === selectedManager)?.name || '';

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-2">
            <Send className="h-5 w-5" />
            <span>כתיבת הודעה חדשה</span>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזרה
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">


        {/* Subject */}
        <div>
          <label className="text-sm font-medium">נושא ההודעה</label>
          <Input
            placeholder="נושא ההודעה"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Manager Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">בחירת מנהל</label>
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger>
              <SelectValue placeholder="בחר מנהל לשליחת ההודעה" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Content */}
        <div>
          {selectedManagerName && (
            <div className="flex justify-end mb-2">
              <span className="text-sm text-gray-600">
                נמען: {selectedManagerName}
              </span>
            </div>
          )}
          <label className="text-sm font-medium">תוכן ההודעה</label>
          <Textarea
            placeholder="כתוב את ההודעה שלך..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] mt-2"
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleSend} 
            className="flex-1" 
            disabled={!message.trim() || !selectedManager}
          >
            <Send className="h-4 w-4 ml-2" />
            {selectedManagerName ? `שלח ל${selectedManagerName}` : 'שלח הודעה'}
          </Button>
          {onBack && (
            <Button 
              onClick={onBack} 
              variant="outline"
              className="px-6"
            >
              ביטול
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageComposer;
