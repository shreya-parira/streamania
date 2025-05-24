
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthForm from '@/components/Auth/AuthForm';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import { streamService } from '@/services/streamService';

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, userData, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Add default livestream if none exists
  useEffect(() => {
    const addDefaultStream = async () => {
      if (userData?.isAdmin) {
        try {
          const streams = await streamService.getAllStreamConfigs();
          if (streams.length === 0) {
            await streamService.createStreamConfig({
              title: 'Live News Stream',
              platform: 'youtube',
              streamId: 'Dx5qFachd3A',
              isActive: true,
              isLive: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            console.log('Default stream added successfully');
          }
        } catch (error) {
          console.log('Could not add default stream:', error);
        }
      }
    };

    if (user && userData?.isAdmin) {
      addDefaultStream();
    }
  }, [user, userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (showForgotPassword) {
      return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
    }
    return (
      <AuthForm 
        isSignUp={isSignUp} 
        onToggle={() => setIsSignUp(!isSignUp)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  if (userData?.isAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default Index;
