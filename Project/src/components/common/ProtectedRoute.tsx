import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useJudge } from '../../context/JudgeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'setter' | 'user')[];
  roles?: ('admin' | 'setter' | 'user')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  roles 
}) => {
  const { currentUser } = useJudge();
  const location = useLocation();
  const activeRoles = roles || allowedRoles;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (activeRoles && !activeRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
