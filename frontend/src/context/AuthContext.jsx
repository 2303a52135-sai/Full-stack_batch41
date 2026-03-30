/**
 * Auth Context
 * Global authentication state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we verify token on mount

  // ─── Load user from localStorage on app start ────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('wardrobe_token');
      const storedUser = localStorage.getItem('wardrobe_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('wardrobe_user', JSON.stringify(data.user));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('wardrobe_token');
          localStorage.removeItem('wardrobe_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('wardrobe_token', data.token);
    localStorage.setItem('wardrobe_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome to StyleVault, ${data.user.name}! 🎉`);
    return data;
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('wardrobe_token', data.token);
    localStorage.setItem('wardrobe_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('wardrobe_token');
    localStorage.removeItem('wardrobe_user');
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  // ─── Update user (after profile edit) ────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('wardrobe_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom hook ──────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
