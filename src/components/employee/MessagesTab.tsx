
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  User, 
  MoreVertical,
  Reply,
  Forward,
  Trash,
  Inbox,

} from "lucide-react";
import { useMessages, useUsers } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/firestore";
import { Timestamp } from "firebase/firestore";
import MessageComposer from "../messaging/MessageComposer";
import MessageViewer, { Message } from "../messaging/MessageViewer";

const MessagesTab = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const [displayMessages, setDisplayMessages] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const { data: messages, loading, error, update } = useMessages();
  const { data: users } = useUsers();
  
  // Update displayMessages when messages change
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Filter messages for current user (only received messages for the inbox view)
    const userMessages = messages.filter((msg: any) => 
      msg.recipientId === currentUser.uid
    );
    
    // Convert to display format
    const formattedMessages = userMessages.map((msg: any) => ({
      id: msg.id || '',
      from: msg.senderName || 'Unknown',
      subject: msg.subject || 'No Subject',
      content: msg.content || '',
      time: msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString('he-IL') : 'Unknown',
      read: msg.isRead || false,
      type: msg.type === 'email' ? 'regular' : (msg.type || 'regular'),
      priority: msg.priority || 'medium',
      senderId: msg.senderId
    }));
    
    setDisplayMessages(formattedMessages);
  }, [messages, currentUser?.uid]);

  const handleSendMessage = async (messageData: { 
    content: string; 
    type: 'regular' | 'holiday' | 'birthday';
    recipients?: string[];
    subject?: string;
  }) => {
    if (!currentUser?.uid) return;
    
    try {
      // Only allow sending to managers - filter recipients to ensure they are managers
      const managers = users.filter(user => user.role === 'manager');
      const managerIds = managers.map(manager => manager.id!);
      
      // If recipients are specified, filter to only include managers
      const recipients = messageData.recipients 
        ? messageData.recipients.filter(id => managerIds.includes(id))
        : managerIds; // Default to all managers if no recipients specified
      
      if (recipients.length === 0) {
        console.warn('No managers found to send message to');
        return;
      }
      
      // Send message to each manager recipient
      for (const recipientId of recipients) {
        const recipient = users.find(user => user.id === recipientId && user.role === 'manager');
        if (!recipient) continue;
        
        await messageService.add({
          senderId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email || 'Employee',
          recipientId: recipientId,
          recipientName: recipient.name,
          subject: messageData.subject || (
            messageData.type === 'holiday' ? "ברכת חג" : 
            messageData.type === 'birthday' ? "ברכת יום הולדת" : 
            "הודעה חדשה"
          ),
          content: messageData.content,
          type: 'message',
          isRead: false,
          priority: 'medium',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      console.log('Message sent successfully to managers');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // Update the message in Firestore to mark it as read
      await messageService.update(messageId, {
        isRead: true,
        updatedAt: Timestamp.now()
      });
      
      console.log('Message marked as read:', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const unreadCount = displayMessages.filter(msg => !msg.read).length;

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>מרכז הודעות</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </CardTitle>
        <CardDescription>
          שליחה וקריאה של הודעות, ברכות חגים ויום הולדת
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">מרכז הודעות</h3>
        </div>

        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inbox" className="flex items-center space-x-2">
              <Inbox className="h-4 w-4" />
              <span>הודעות נכנסות</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>כתיבת הודעה</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">הודעות ({displayMessages.length})</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">טוען הודעות...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>שגיאה בטעינת ההודעות</p>
                </div>
              ) : displayMessages.length > 0 ? (
                <MessageViewer 
                  messages={displayMessages} 
                  onMarkAsRead={handleMarkAsRead}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>אין הודעות חדשות</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compose" className="mt-6">
            <MessageComposer 
              employees={users
                .filter(user => user.role === 'manager')
                .map(user => ({
                  id: user.id!,
                  name: user.name,
                  email: user.email,
                  department: user.department || '',
                  role: user.role
                }))}
              onSendMessage={handleSendMessage}
            />
          </TabsContent>
        </Tabs>
      </CardContent>


    </Card>
  );
};

export default MessagesTab;
