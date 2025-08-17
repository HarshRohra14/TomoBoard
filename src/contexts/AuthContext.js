import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authAPI.me();
          const userData = response.data.user;
          // Add token to user object for WebSocket authentication
          setUser({ ...userData, token });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await authAPI.login({ email, password });
      const { user: userData, tokens } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set user with token for WebSocket
      const userWithToken = { ...userData, token: tokens.accessToken };
      setUser(userWithToken);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const response = await authAPI.signup({
        email,
        username: email.split('@')[0], // Generate username from email
        password,
        firstName,
        lastName,
      });
      
      const { user: userData, tokens } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set user with token for WebSocket
      const userWithToken = { ...userData, token: tokens.accessToken };
      setUser(userWithToken);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
