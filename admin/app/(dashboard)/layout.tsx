'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if there's a token in localStorage even if admin state isn't loaded yet
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (!token && !admin) {
        // No token and no admin, redirect to login
        router.push('/login');
      } else if (token && !admin) {
        // There's a token but no admin state, try to refresh
        // In this case, we'll just wait as the auth hook should handle this
      }
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Check for token in localStorage as a fallback
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (!admin && !token && !isLoading) {
    return null; // Will redirect via useEffect
  }
  
  // If admin is not loaded but token exists, show loading state briefly
  if (!admin && token && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // If we have admin, render the dashboard
  if (admin) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }
  
  // If still loading or token exists but admin not loaded yet, show spinner
  if (isLoading || (token && !admin)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Fallback: return null to allow useEffect to handle redirect
  return null;
}