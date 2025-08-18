
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, LogOut, Calendar, MessageSquare, ArrowLeftRight, Menu, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export interface EmployeeHeaderProps {
  onBack: () => void;
  onOpenPersonalArea: () => void;
  onLogoClick?: () => void;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  unreadMessages?: number;
}

const EmployeeHeader = ({ onBack, onOpenPersonalArea, onLogoClick, activeTab = "schedule", onTabChange, unreadMessages = 0 }: EmployeeHeaderProps) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get user display name with fallback
  const userName = userProfile?.name || currentUser?.displayName || "עובד";
  const initials = userName.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    // If onLogoClick is provided, use it, otherwise default to going back to dashboard
    if (onLogoClick) {
      onLogoClick();
    }
    // If no specific logo handler is provided, we'll just stay on the current page
    // This prevents unintended logout or navigation
  };

  const handleTabChange = (tabId: string) => {
    console.log('EmployeeHeader: Tab change requested:', tabId);
    if (onTabChange) {
      onTabChange(tabId);
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    } else {
      console.warn('EmployeeHeader: onTabChange prop is not provided');
    }
  };

  const navItems = [
    { id: 'schedule', label: 'תוכנית עבודה', icon: Calendar },
    { id: 'swap', label: '  קורסי למידה  ', icon: BookOpen },
    { id: 'messages', label: 'הודעות', icon: MessageSquare }
  ];

  return (
    <header className="bg-white shadow-sm border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">התנתק</span>
            </Button>
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
              <img 
                src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                alt="לוגו קשר" 
                className="h-12 w-12 sm:h-16 sm:w-16 hover:opacity-80 transition-opacity"
              />
            </div>
            
            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse text-lg font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-100 text-green-700 shadow-md' 
                        : 'text-gray-900 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.id === 'messages' && unreadMessages > 0 && (
                      <Badge variant="destructive" className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Badge variant="outline" className="bg-green-50 text-green-700 hidden sm:flex">
              <Clock className="h-3 w-3 ml-1" />
              משמרת פעילה
            </Badge>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenPersonalArea}>
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <h1 className="text-base font-bold text-gray-900">{userName}</h1>
                <p className="text-sm font-medium text-gray-900">אזור אישי</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleTabChange(item.id)}
                    className={`justify-start w-full transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-100 text-green-700 shadow-md' 
                        : 'text-gray-900 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
                    <span>{item.label}</span>
                    {item.id === 'messages' && unreadMessages > 0 && (
                      <Badge variant="destructive" className="mr-auto h-5 w-5 rounded-full p-0 text-xs">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmployeeHeader;
