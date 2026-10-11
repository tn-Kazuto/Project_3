import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('novatech_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('novatech_token') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('novatech_refresh_token') || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('novatech_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('novatech_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('novatech_token', token);
    } else {
      localStorage.removeItem('novatech_token');
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('novatech_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('novatech_refresh_token');
    }
  }, [refreshToken]);

  /**
   * Gọi API thật sang CoreBackend: POST /api/auth/login
   */
  const login = async (usernameOrEmail, password) => {
    const result = await authApi.login(usernameOrEmail, password);

    if (result.success) {
      setUser(result.user);
      setToken(result.accessToken);
      if (result.refreshToken) {
        setRefreshToken(result.refreshToken);
      }
      return { success: true, user: result.user };
    }

    return {
      success: false,
      error: result.error,
      isNetworkError: result.isNetworkError
    };
  };

  /**
   * Gọi API thật sang CoreBackend: POST /api/auth/register
   */
  const register = async (fullName, email, password, username, phone) => {
    const result = await authApi.register({
      fullName,
      email,
      password,
      username,
      phone
    });

    if (result.success) {
      setUser(result.user);
      setToken(result.accessToken);
      if (result.refreshToken) {
        setRefreshToken(result.refreshToken);
      }
      return { success: true, user: result.user };
    }

    return {
      success: false,
      error: result.error,
      isNetworkError: result.isNetworkError
    };
  };

  /**
   * Đăng xuất và thu hồi Refresh Token trên CoreBackend
   */
  const logout = async () => {
    if (refreshToken || token) {
      await authApi.logout(refreshToken, token);
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
