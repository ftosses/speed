import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useZone } from '../../context/ZoneContext';

const PrivateRoute = ({ children, requiredRole, requireZone = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { hasZoneSelected } = useZone();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/zone-selection" replace />;
      case 'repartidor':
        return <Navigate to="/repartidor/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check if zone selection is required (for admin)
  if (requireZone && !hasZoneSelected) {
    return <Navigate to="/zone-selection" replace />;
  }

  return children;
};

export default PrivateRoute;
