// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';   // ⬅️ added
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // user is logged out ➜ go to landing page
    return <Navigate to="/" replace />;       // ⬅️ changed
  }

  return children;
};

export default ProtectedRoute;
