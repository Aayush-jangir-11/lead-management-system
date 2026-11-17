import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Loading state while checking localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 tracking-wide">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // 2. If not authenticated, redirect to /login with previous location state
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Role-Based Check: If specific roles are required, verify access
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the appropriate portal based on their actual role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'sales_person') {
      return <Navigate to="/salesperson/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Authorized: render child routes
  return <Outlet />;
}

