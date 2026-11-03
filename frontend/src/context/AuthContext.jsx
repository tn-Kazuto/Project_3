import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jamesthew_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('jamesthew_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.data && res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const res = await authApi.login({ emailOrUsername, password });
    if (res.data && res.data.success) {
      const { token: jwtToken, user: userData } = res.data.data;
      localStorage.setItem('jamesthew_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const register = async (registerData) => {
    const res = await authApi.register(registerData);
    if (res.data && res.data.success) {
      const { token: jwtToken, user: userData } = res.data.data;
      localStorage.setItem('jamesthew_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('jamesthew_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.data && res.data.success) {
        setUser(res.data.data);
      }
    } catch {
      // Ignore
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isMember: user?.role === 'MEMBER',
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

