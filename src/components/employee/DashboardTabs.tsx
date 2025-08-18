
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<<<<<<< HEAD
import { Calendar, MessageSquare, BookOpen } from "lucide-react";
import ScheduleTab from "./ScheduleTab";
import MessagesTab from "./MessagesTab";
import ShiftSwapMarketplace from "./ShiftSwapMarketplace";
import { useEffect } from "react";
=======
import { Calendar, Mail, MessageSquare, BookOpen } from "lucide-react";
import ScheduleTab from "./ScheduleTab";
import MessagesTab from "./MessagesTab";
import EmailsTab from "./EmailsTab";
import LearningTab from "./LearningTab";
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9

interface DashboardTabsProps {
  unreadMessages: number;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  onOpenCalendar?: () => void;
}

const DashboardTabs = ({ unreadMessages, activeTab = "schedule", onTabChange, onOpenCalendar }: DashboardTabsProps) => {
  const handleTabChange = (value: string) => {
    console.log('DashboardTabs: Tab changed to:', value);
    console.log('DashboardTabs: Previous activeTab was:', activeTab);
    if (onTabChange) {
      onTabChange(value);
    } else {
      console.warn('DashboardTabs: onTabChange prop is not provided');
    }
  };

  // Log when activeTab changes
  useEffect(() => {
    console.log('DashboardTabs: activeTab changed to:', activeTab);
  }, [activeTab]);

  return (
<<<<<<< HEAD
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="schedule" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="h-4 w-4" />
            <span>תוכנית עבודה</span>
          </TabsTrigger>
          <TabsTrigger value="swap" className="flex items-center space-x-2 rtl:space-x-reverse">
            <BookOpen className="h-4 w-4" />
            <span> קורסי למידה </span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2 rtl:space-x-reverse">
            <MessageSquare className="h-4 w-4" />
            <span>הודעות</span>
            {unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-0">
          <ScheduleTab onOpenCalendar={onOpenCalendar} />
        </TabsContent>

        <TabsContent value="swap" className="mt-0">
          <ShiftSwapMarketplace />
        </TabsContent>

        <TabsContent value="messages" className="mt-0">
          <MessagesTab />
        </TabsContent>
      </Tabs>
    </div>
=======
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="schedule" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>סידורים</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>הודעות</span>
          {unreadMessages > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {unreadMessages}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="emails" className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>מיילים</span>
          {unreadEmails > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {unreadEmails}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="learning" className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>למידה</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="schedule">
        <ScheduleTab onOpenCalendar={onOpenCalendar} />
      </TabsContent>

      <TabsContent value="messages">
        <MessagesTab />
      </TabsContent>

      <TabsContent value="emails">
        <EmailsTab unreadEmails={unreadEmails} onOpenInbox={onOpenInbox} />
      </TabsContent>

      <TabsContent value="learning">
        <LearningTab />
      </TabsContent>
    </Tabs>
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9
  );
};

export default DashboardTabs;
