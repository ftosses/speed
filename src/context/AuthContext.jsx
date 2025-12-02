import React, { createContext, useState, useContext, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('speed_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('speed_user');
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (credentials) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const { email, password, role } = credentials;

      // Mock validation - any email/password works for demo
      if (!email || !password || !role) {
        throw new Error('Por favor complete todos los campos');
      }

      // Create user object based on role
      let userData;

      switch (role) {
        case ROLES.ADMIN:
          userData = {
            id: 1,
            email,
            name: 'Administrador',
            role: ROLES.ADMIN,
            permissions: ['all']
          };
          break;

        case ROLES.REPARTIDOR:
          userData = {
            id: 2,
            email,
            name: 'Juan Pérez',
            role: ROLES.REPARTIDOR,
            zone: null, // Will be assigned by admin
            vehicleType: 'Moto',
            permissions: ['view_route', 'create_order', 'register_payment', 'invoice']
          };
          break;

        default:
          throw new Error('Rol no válido');
      }

      // Save to localStorage
      localStorage.setItem('speed_user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('speed_user');
    localStorage.removeItem('speed_zone');
    setUser(null);
  };

  // Update user data
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('speed_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === ROLES.ADMIN,
    isRepartidor: user?.role === ROLES.REPARTIDOR
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
