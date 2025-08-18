import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Users, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ManagerNavbarProps {
  onBack: () => void;
  currentView: 'dashboard' | 'staff' | 'schedule' | 'messages';
  onNavigate: (view: 'dashboard' | 'staff' | 'schedule' | 'messages') => void;
  onLogoClick?: () => void;
}

const ManagerNavbar = ({ onBack, currentView, onNavigate, onLogoClick }: ManagerNavbarProps) => {
  const { currentUser, userProfile, logout } = useAuth();
  
  // Get manager display name with fallback
  const managerName = userProfile?.name || currentUser?.displayName || "מנהל";
  const initials = managerName.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase();
  
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
  
  const navItems: Array<{id: 'dashboard' | 'staff' | 'schedule' | 'messages', label: string, icon: any}> = [
    { id: 'dashboard', label: 'לוח בקרה', icon: TrendingUp },
    { id: 'staff', label: 'ניהול צוות', icon: Users },
    { id: 'schedule', label: ' תוכנית עבודה ', icon: Calendar },
    { id: 'messages', label: 'הודעות', icon: MessageSquare }
  ];

  return (
    <header className="bg-white shadow-sm border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-reverse space-x-2 text-lg font-semibold text-gray-900">
              <LogOut className="h-5 w-5" />
              <span>התנתק</span>
            </Button>
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-reverse space-x-3 cursor-pointer" onClick={handleLogoClick}>
              <img 
                src="/lovable-uploads/012fab03-40df-4b6a-ac3a-384ef53bbd8a.png" 
                alt="לוגו קשר" 
                className="h-16 w-16 hover:opacity-80 transition-opacity"
              />
            </div>
            
            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-reverse space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-reverse space-x-2 text-lg font-semibold ${
                      currentView === item.id ? 'bg-violet-100 text-violet-700' : 'text-gray-900 hover:text-violet-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-4">
            <Badge variant="outline" className="bg-violet-50 text-violet-700">
              <Users className="h-3 w-3 ml-1" />
              מנהל משמרת
            </Badge>

            <div className="flex items-center space-x-reverse space-x-3">
              <Avatar>
                <AvatarFallback className="bg-violet-100 text-violet-700">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <h1 className="text-base font-bold text-gray-900">{managerName}</h1>
                <p className="text-sm font-medium text-gray-900">מנהל</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerNavbar;