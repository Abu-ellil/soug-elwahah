import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading, restoreAuthState } = useAuthStore();

  useEffect(() => {
    // Restore auth state when the component mounts
    if (loading) {
      restoreAuthState();
    }
  }, [loading, restoreAuthState]);

  // If still loading, don't render anything or show a loading screen
  if (loading) {
    return null; // Or return a loading component
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

 // If logged in, render the children
 return children;
};

export default ProtectedRoute;