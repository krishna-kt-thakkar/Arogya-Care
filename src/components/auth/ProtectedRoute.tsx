import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // While auth state is loading, show spinner — don't flash content or redirect
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking your session..." />;
  }

  // If no user after loading resolves, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
