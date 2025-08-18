
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Gift, Cake, Eye, CheckCircle, Send } from "lucide-react";

export interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  time: string;
  read: boolean;
  type: 'regular' | 'holiday' | 'birthday';
}

interface MessageViewerProps {
  messages: Message[];
  onMarkAsRead: (messageId: string) => void;
  onComposeNew?: () => void;
  title?: string;
  isSentView?: boolean;
}

const MessageViewer = ({ messages, onMarkAsRead, onComposeNew, title = "הודעות", isSentView = false }: MessageViewerProps) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'holiday': return <Gift className="h-4 w-4 text-emerald-600" />;
      case 'birthday': return <Cake className="h-4 w-4 text-pink-600" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMessageBadge = (type: string) => {
    switch (type) {
      case 'holiday': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">ברכת חג</Badge>;
      case 'birthday': return <Badge variant="secondary" className="bg-pink-100 text-pink-700">יום הולדת</Badge>;
      default: return null;
    }
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      onMarkAsRead(message.id);
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין הודעות</h3>
        <p className="text-gray-600 mb-6">תיבת הדואר שלך ריקה</p>
        {onComposeNew && (
          <Button onClick={onComposeNew}>
            <Send className="h-4 w-4 ml-2" />
            שלח הודעה ראשונה
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title} ({messages.length})</h3>
          {!isSentView && unreadCount > 0 && (
            <p className="text-sm text-gray-600">{unreadCount} הודעות חדשות</p>
          )}
          {isSentView && (
            <p className="text-sm text-gray-600">הודעות שנשלחו מהמערכת</p>
          )}
        </div>
        {onComposeNew && (
          <Button onClick={onComposeNew} size="sm">
            <Send className="h-4 w-4 ml-2" />
            הודעה חדשה
          </Button>
        )}
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              !message.read ? 'border-emerald-200 bg-emerald-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{message.from[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getMessageIcon(message.type)}
                      <p className="font-medium">{message.subject}</p>
                      {getMessageBadge(message.type)}
                    </div>
                    <p className="text-sm text-gray-600">{isSentView ? message.from : `מאת: ${message.from}`}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.content.length > 80 
                        ? `${message.content.substring(0, 80)}...` 
                        : message.content
                      }
                    </p>
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <p className="text-sm text-gray-500">{message.time}</p>
                  <div className="flex items-center space-x-2">
                    {!isSentView && !message.read && (
                      <Badge variant="destructive" className="text-xs">חדש</Badge>
                    )}
                    {isSentView && (
                      <Badge variant="secondary" className="text-xs">נשלח</Badge>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenMessage(message)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          קרא
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl rtl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            {getMessageIcon(message.type)}
                            <span>{message.subject}</span>
                            {getMessageBadge(message.type)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Avatar>
                              <AvatarFallback>{message.from[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{message.from}</p>
                              <p className="text-sm text-gray-600">{message.time}</p>
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg bg-white">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {!isSentView && message.read && (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">הודעה נקראה</span>
                            </div>
                          )}
                          {isSentView && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Send className="h-4 w-4" />
                              <span className="text-sm">הודעה נשלחה בהצלחה</span>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state when no messages */}
      {messages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הודעות</h3>
          <p className="text-gray-600 mb-6">תיבת הדואר שלך ריקה</p>
          {onComposeNew && (
            <Button onClick={onComposeNew}>
              <Send className="h-4 w-4 ml-2" />
              שלח הודעה ראשונה
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageViewer;
