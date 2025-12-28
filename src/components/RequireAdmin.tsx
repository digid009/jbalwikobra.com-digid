import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';

const RequireAdmin: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[DEBUG] RequireAdmin - user:', user ? `email: ${user.email}, isAdmin: ${user.isAdmin}` : 'null', 'loading:', loading);

  if (loading) {
    return (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-full max-w-xs px-6">
      <div className="h-4 w-28 mb-3 rounded bg-white/10 animate-pulse"></div>
      <div className="h-3.5 w-full mb-2 rounded bg-white/10 animate-pulse"></div>
      <div className="h-3.5 w-5/6 rounded bg-white/10 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
