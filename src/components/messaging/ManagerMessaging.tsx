
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Send, Users, Gift, Cake, Plus } from "lucide-react";
import MessageComposer from "./MessageComposer";
import MessageViewer, { Message } from "./MessageViewer";
import { useMessages, useUsers } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Message as FirestoreMessage } from "@/services/firestore";
import { Timestamp } from "firebase/firestore";

interface ManagerMessagingProps {
  onBack?: () => void;
}

const ManagerMessaging = ({ onBack }: ManagerMessagingProps = {}) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [templateData, setTemplateData] = useState<{
    subject: string;
    content: string;
    type: 'regular' | 'holiday' | 'birthday';
  } | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Array<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: 'regular' | 'holiday' | 'birthday';
    createdAt: Date;
  }>>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: 'regular' as 'regular' | 'holiday' | 'birthday'
  });
  const { currentUser } = useAuth();
  const { data: firestoreMessages, loading: messagesLoading, error: messagesError, add, update } = useMessages();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();
  const { toast } = useToast();
  
  // Convert Firestore messages to Message format (received messages)
  const receivedMessages: Message[] = firestoreMessages
    .filter(msg => msg.recipientId === currentUser?.uid)
    .map(msg => ({
      id: msg.id || '',
      from: msg.senderName || 'Unknown',
      subject: msg.subject || 'No Subject',
      content: msg.content || '',
      time: msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString('he-IL') : 'Unknown',
      read: msg.isRead || false,
      type: (msg.type === 'email' || msg.type === 'message' || msg.type === 'notification') ? 'regular' : 'regular'
    }));

  // Convert Firestore messages to Message format (sent messages)
  const sentMessages: Message[] = firestoreMessages
    .filter(msg => msg.senderId === currentUser?.uid)
    .map(msg => ({
      id: msg.id || '',
      from: `אל: ${msg.recipientName || 'Unknown'}`,
      subject: msg.subject || 'No Subject',
      content: msg.content || '',
      time: msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString('he-IL') : 'Unknown',
      read: true, // Sent messages are always "read" from sender perspective
      type: (msg.type === 'email' || msg.type === 'message' || msg.type === 'notification') ? 'regular' : 'regular'
    }));

  // Convert Firestore users to employee format
  const employees = users
    .filter(user => user.role === 'employee')
    .map(user => ({
      id: user.id || '',
      name: user.name || 'Unknown',
      role: user.position || 'Employee'
    }));

  const handleSendMessage = async (messageData: { 
    content: string; 
    type: 'regular' | 'holiday' | 'birthday';
    recipients?: string[];
    subject?: string;
  }) => {
    try {
      const recipients = messageData.recipients || employees.map(emp => emp.id);
      
      // Send to all recipients
      for (const recipientId of recipients) {
        const recipient = users.find(user => user.id === recipientId);
        if (recipient) {
          await add({
            senderId: currentUser?.uid || 'manager',
            senderName: currentUser?.displayName || 'מנהל',
            recipientId: recipientId,
            recipientName: recipient.name,
            subject: messageData.subject || (messageData.type === 'holiday' ? "ברכת חג לצוות" : messageData.type === 'birthday' ? "ברכת יום הולדת" : "הודעה חדשה"),
            content: messageData.content,
            type: messageData.type === 'holiday' ? 'notification' : messageData.type === 'birthday' ? 'notification' : 'message',
            isRead: false,
            priority: 'medium',
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          });
        }
      }

      toast({
        title: "הודעה נשלחה בהצלחה",
        description: `ההודעה נשלחה ל${recipients.length} עובדים`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשליחת ההודעה",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await update(messageId, {
        isRead: true,
        updatedAt: new Date() as any
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון סטטוס ההודעה",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToCompose = (template?: { subject: string; content: string; type: 'regular' | 'holiday' | 'birthday' }) => {
    if (template) {
      setTemplateData(template);
    }
    setActiveTab("compose");
  };

  const handleTemplateApplied = () => {
    setTemplateData(null);
  };

  const handleCreateCustomTemplate = () => {
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      type: 'regular'
    });
    setIsTemplateDialogOpen(true);
  };

  const handleSaveCustomTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.content.trim()) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    const template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      content: newTemplate.content,
      type: newTemplate.type,
      createdAt: new Date()
    };

    setCustomTemplates(prev => [template, ...prev]);
    
    toast({
      title: "תבנית נשמרה",
      description: `התבנית "${newTemplate.name}" נשמרה בהצלחה`,
    });

    setIsTemplateDialogOpen(false);
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      type: 'regular'
    });
  };

  const handleUseCustomTemplate = (template: typeof customTemplates[0]) => {
    handleNavigateToCompose({
      subject: template.subject,
      content: template.content,
      type: template.type
    });
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "תבנית נמחקה",
      description: "התבנית נמחקה בהצלחה",
    });
  };

  const unreadCount = receivedMessages.filter(msg => !msg.read).length;
  const totalSentMessages = sentMessages.length;
  const messagesThisWeek = firestoreMessages.filter(msg => {
    const msgDate = msg.createdAt.toDate();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return msgDate >= weekAgo;
  }).length;

  if (messagesLoading || usersLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        {onBack && (
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} variant="outline">
              חזרה
            </Button>
          </div>
        )}
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתוני הודעות...</p>
        </div>
      </div>
    );
  }

  if (messagesError || usersError) {
    return (
      <div className="space-y-6" dir="rtl">
        {onBack && (
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} variant="outline">
              חזרה
            </Button>
          </div>
        )}
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת נתונים</h3>
          <p className="text-gray-600">{messagesError?.message || usersError?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {onBack && (
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            חזרה
          </Button>
        </div>
      )}
      
      {/* כותרת עיקרית */}
      <div className="mb-8">
        <div className="flex items-center space-x-reverse space-x-4 mb-2">
          <div className="bg-violet-600 p-3 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">מערכת הודעות מנהלים</h2>
            <p className="text-lg text-gray-600">תקשורת עם הצוות, שליחת ברכות ומתנות</p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>מרכז הודעות</span>
            <div className="flex items-center space-x-reverse space-x-2">
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} חדשות</Badge>
              )}
              <Button onClick={() => handleNavigateToCompose()} size="sm">
                <Send className="h-4 w-4 ml-2" />
                הודעה חדשה
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            ניהול הודעות, ברכות ותקשורת עם הצוות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="inbox" className="flex items-center space-x-reverse space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>נכנסות</span>
                {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center space-x-reverse space-x-2">
                <Send className="h-4 w-4" />
                <span>נשלחות</span>
                <Badge variant="secondary" className="text-xs">{totalSentMessages}</Badge>
              </TabsTrigger>
              <TabsTrigger value="compose" className="flex items-center space-x-reverse space-x-2">
                <Plus className="h-4 w-4" />
                <span>חדשה</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-reverse space-x-2">
                <Gift className="h-4 w-4" />
                <span>תבניות</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-reverse space-x-2">
                <Users className="h-4 w-4" />
                <span>נתונים</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="space-y-4">
              <MessageViewer 
                messages={receivedMessages} 
                onMarkAsRead={handleMarkAsRead}
                onComposeNew={handleNavigateToCompose}
                title="הודעות נכנסות"
              />
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <MessageViewer 
                messages={sentMessages} 
                onMarkAsRead={() => {}} // No action needed for sent messages
                onComposeNew={handleNavigateToCompose}
                title="הודעות שנשלחו"
                isSentView={true}
              />
            </TabsContent>

            <TabsContent value="compose" className="space-y-4">
              <MessageComposer 
                employees={employees}
                onSendMessage={handleSendMessage}
                onBack={() => setActiveTab("inbox")}
                templateData={templateData}
                onTemplateApplied={handleTemplateApplied}
              />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4" dir="rtl">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-reverse space-x-2">
                      <Gift className="h-5 w-5" />
                      <span>ברכות חג</span>
                    </CardTitle>
                    <CardDescription>
                      תבניות לברכות חג לצוות
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "ברכת חג שמח לכל הצוות",
                        content: "חג שמח לכל הצוות!\n\nאני רוצה לאחל לכם ולמשפחותיכם חג שמח ומבורך.\nתודה על העבודה הנפלאה שלכם והמסירות הרבה.\n\nחג שמח!\nהנהלה",
                        type: 'holiday'
                      })}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      ברכת חג שמח
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "שנה טובה ומבוברכת",
                        content: "שנה טובה!\n\nבשם כל הנהלת החברה, אני מאחל לכם ולמשפחותיכם שנה טובה ומוצלחת.\nמקווה שהשנה הבאה תביא איתה הצלחה, בריאות ואושר לכולם.\n\nשנה טובה!\nהנהלה",
                        type: 'holiday'
                      })}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      ברכת שנה טובה
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "חנוכה שמח",
                        content: "חנוכה שמח!\n\nמאחל לכם ולמשפחותיכם חג חנוכה שמח ומאיר.\nתודה על העבודה המסורה שלכם לאורך השנה.\n\nחנוכה שמח!\nהנהלה",
                        type: 'holiday'
                      })}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      ברכת חנוכה שמח
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-reverse space-x-2">
                      <Cake className="h-5 w-5" />
                      <span>ימי הולדת</span>
                    </CardTitle>
                    <CardDescription>
                      תבניות לברכות יום הולדת
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "מזל טוב!",
                        content: "מזל טוב!\n\nביום הולדתך המיוחד, אני רוצה לאחל לך יום הולדת שמח ומלא בשמחה.\nתודה על התרומה הגדולה שלך לצוות ועל העבודה המצוינת.\n\nיום הולדת שמח!\nהנהלה",
                        type: 'birthday'
                      })}
                    >
                      <Cake className="h-4 w-4 ml-2" />
                      מזל טוב!
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "יום הולדת שמח",
                        content: "יום הולדת שמח!\n\nמאחל לך יום הולדת נפלא מלא באושר ושמחה.\nאנחנו שמחים שאת/ה חלק מהצוות שלנו.\n\nכל הטוב,\nהנהלה",
                        type: 'birthday'
                      })}
                    >
                      <Cake className="h-4 w-4 ml-2" />
                      יום הולדת שמח
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "ברכות ליום הולדתך",
                        content: "ברכות חמות ליום הולדתך!\n\nביום מיוחד זה, אני רוצה לברך אותך ולהודות לך על כל מה שאת/ה עושה עבור הצוות.\nמקווה שהשנה הבאה תביא איתה הצלחה רבה.\n\nברכות,\nהנהלה",
                        type: 'birthday'
                      })}
                    >
                      <Cake className="h-4 w-4 ml-2" />
                      ברכות ליום הולדתך
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-reverse space-x-2">
                      <Users className="h-5 w-5" />
                      <span>הודעות צוות</span>
                    </CardTitle>
                    <CardDescription>
                      תבניות להודעות צוות כלליות
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "עדכון חשוב מההנהלה",
                        content: "שלום לכולם,\n\nיש לי עדכון חשוב לשתף איתכם:\n\n[כתוב כאן את העדכון]\n\nאם יש לכם שאלות, אנא פנו אלי ישירות.\n\nתודה,\nהנהלה",
                        type: 'regular'
                      })}
                    >
                      <Users className="h-4 w-4 ml-2" />
                      עדכון חשוב
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "זימון לפגישה שבועית",
                        content: "שלום לכולם,\n\nאני מזמין אתכם לפגישה השבועית שלנו:\n\nמועד: [תאריך ושעה]\nמיקום: [מיקום הפגישה]\n\nנושאים לדיון:\n- [נושא 1]\n- [נושא 2]\n- [נושא 3]\n\nאנא הגיעו בזמן.\n\nתודה,\nהנהלה",
                        type: 'regular'
                      })}
                    >
                      <Users className="h-4 w-4 ml-2" />
                      פגישה שבועית
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleNavigateToCompose({
                        subject: "הודעה כללית לצוות",
                        content: "שלום לכולם,\n\n[כתוב כאן את ההודעה הכללית]\n\nתודה על קשב,\nהנהלה",
                        type: 'regular'
                      })}
                    >
                      <Users className="h-4 w-4 ml-2" />
                      הודעה כללית
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-reverse space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>הודעות מותאמות</span>
                    </CardTitle>
                    <CardDescription>
                      צור תבניות מותאמות אישית
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={handleCreateCustomTemplate}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      צור תבנית חדשה
                    </Button>
                    
                    {/* Display custom templates */}
                    {customTemplates.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">התבניות שלי</h4>
                        {customTemplates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{template.name}</p>
                              <p className="text-xs text-gray-600">{template.subject}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUseCustomTemplate(template)}
                                className="text-xs px-2"
                              >
                                השתמש
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCustomTemplate(template.id)}
                                className="text-xs px-2 text-red-600 hover:text-red-700"
                              >
                                מחק
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">הודעות השבוע</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{messagesThisWeek}</div>
                    <p className="text-sm text-gray-600">הודעות נשלחו השבוע</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">סך הכל נשלחו</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSentMessages}</div>
                    <p className="text-sm text-gray-600">הודעות נשלחו סה״כ</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">הודעות שלא נקראו</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{unreadCount}</div>
                    <p className="text-sm text-gray-600">הודעות ממתינות</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>



      {/* Custom Template Creation Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>צור תבנית חדשה</DialogTitle>
            <DialogDescription>
              צור תבנית מותאמת אישית לשימוש חוזר
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">שם התבנית</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="הכנס שם לתבנית (לדוגמה: ברכה לחג פסח)"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">סוג התבנית</label>
              <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate({...newTemplate, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג תבנית" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">הודעה רגילה</SelectItem>
                  <SelectItem value="holiday">ברכת חג</SelectItem>
                  <SelectItem value="birthday">יום הולדת</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">נושא ההודעה</label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                placeholder="נושא ההודעה"
              />
            </div>

            <div>
              <label className="text-sm font-medium">תוכן ההודעה</label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                placeholder="כתוב את תוכן התבנית כאן..."
                className="min-h-[120px]"
                dir="rtl"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>טיפ:</strong> תוכל להשתמש במשתנים כמו [שם העובד] או [תאריך] בתבנית. 
                הם יוחלפו אוטומטית בעת השימוש.
              </p>
            </div>

            <div className="flex justify-end space-x-reverse space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                ביטול
              </Button>
              <Button onClick={handleSaveCustomTemplate}>
                שמור תבנית
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerMessaging;
