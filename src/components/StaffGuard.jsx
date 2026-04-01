import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getAdminSession } from '@/lib/adminSession';
import AppLayout from './layout/AppLayout';

export default function StaffGuard() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#4B0082] rounded-full animate-spin" />
      </div>
    );
  }

  const adminSession = getAdminSession();

  if (!isAuthenticated && !adminSession) {
    return <Navigate to="/admin-login" replace />;
  }

  return <AppLayout />;
}