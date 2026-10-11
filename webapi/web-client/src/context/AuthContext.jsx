import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = async (email, password) => {
    // Sẵn sàng kết nối API Backend .NET 10: /api/auth/login
    // Tạm thời mô phỏng đăng nhập thành công
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email && password) {
      const mockUser = {
        id: 'usr_10293',
        fullName: email.split('@')[0],
        email: email,
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        phone: '0901 234 567'
      };
      const mockToken = 'mock_jwt_token_for_dotnet_api_' + Date.now();
      setUser(mockUser);
      setToken(mockToken);
      return { success: true, user: mockUser };
    }
    return { success: false, error: 'Vui lòng nhập email và mật khẩu' };
  };

  const register = async (fullName, email, _password) => {
    // Sẵn sàng kết nối API Backend .NET 10: /api/auth/register
    await new Promise(resolve => setTimeout(resolve, 600));

    const newUser = {
      id: 'usr_' + Date.now(),
      fullName: fullName,
      email: email,
      role: 'Customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: ''
    };
    const mockToken = 'mock_jwt_token_for_dotnet_api_' + Date.now();
    setUser(newUser);
    setToken(mockToken);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
