import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getAdminSession } from '@/lib/adminSession';
import AppLayout from './layout/AppLayout';

const STAFF_ROLES = ['admin', 'doctor'];
const ADMIN_LOGIN_URL = '/admin-login?key=sdnexus2026';

export default function StaffGuard() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, user } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#4B0082] rounded-full animate-spin" />
      </div>
    );
  }

  const adminSession = getAdminSession();

  // Logged in with Google but not a staff role → block
  if (isAuthenticated && !STAFF_ROLES.includes(user?.role)) {
    return <Navigate to={ADMIN_LOGIN_URL} replace />;
  }

  // Not authenticated at all and no local admin session → redirect to login
  if (!isAuthenticated && !adminSession) {
    return <Navigate to={ADMIN_LOGIN_URL} replace />;
  }

  return <AppLayout />;
}