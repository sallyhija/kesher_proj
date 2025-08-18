import { useState, useEffect } from "react";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import LoginForm from "@/components/LoginForm";
import EmployeeSignup from "@/components/EmployeeSignup";
import LandingPage from "@/components/LandingPage";

import PersonalArea from "@/components/employee/PersonalArea";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'personal'>('landing');
  const { currentUser, userProfile, loading } = useAuth();

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToSignup = () => {
    setCurrentPage('signup');
  };

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Effect to handle authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', { currentUser: !!currentUser, userProfile, loading });
    
    if (currentUser && userProfile) {
      console.log('User authenticated, redirecting to dashboard. Role:', userProfile.role);
      setCurrentPage('dashboard');
    } else if (!loading && !currentUser) {
      console.log('No user, redirecting to landing');
      setCurrentPage('landing');
    }
  }, [currentUser, userProfile, loading]);



  const handleOpenPersonalArea = () => {
    setCurrentPage('personal');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  if (currentPage === 'landing') {
    return <LandingPage onNavigateToLogin={handleNavigateToLogin} onNavigateToSignup={handleNavigateToSignup} />;
  }

  if (currentPage === 'login') {
    return <LoginForm onLogin={() => {}} onBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'signup') {
    return <EmployeeSignup onNavigateToLogin={handleNavigateToLogin} onBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'dashboard' && userProfile?.role === 'employee') {
    return <EmployeeDashboard onBack={handleLogout} onOpenPersonalArea={handleOpenPersonalArea} />;
  }

  if (currentPage === 'dashboard' && userProfile?.role === 'manager') {
    return <ManagerDashboard onBack={handleLogout} />;
  }



  if (currentPage === 'personal' && userProfile?.role === 'employee') {
    return <PersonalArea onBack={handleBackToDashboard} />;
  }

  // Show loading state while Firebase is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index; 