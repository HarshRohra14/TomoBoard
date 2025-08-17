import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { offlineAuth } from '../services/offlineAuth';

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
      console.log('Attempting login with:', email);

      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);

      const { user: userData, tokens } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Set user with token for WebSocket
      const userWithToken = { ...userData, token: tokens.accessToken };
      setUser(userWithToken);

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);

      // Check if it's a network error (backend unreachable)
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        console.log('Network error detected, using offline auth service');

        try {
          const response = await offlineAuth.login(email, password);
          const { user: userData, tokens } = response.data;

          // Store tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          // Set user with token
          const userWithToken = { ...userData, token: tokens.accessToken };
          setUser(userWithToken);

          console.log('Offline login successful');
          return { success: true };
        } catch (offlineErr) {
          console.error('Offline auth failed:', offlineErr);
          setError('Backend unavailable. Try demo@tomoboard.com / password123');
          return { success: false, error: 'Backend unavailable. Try demo@tomoboard.com / password123' };
        }
      }

      const message = err.response?.data?.error || err.message || 'Login failed. Please try again.';
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
      console.error('Signup error:', err);

      // Network error fallback
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        console.log('Network error detected, using offline signup');

        try {
          const nameParts = name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const response = await offlineAuth.signup({
            email,
            username: email.split('@')[0],
            password,
            firstName,
            lastName,
          });

          const { user: userData, tokens } = response.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          const userWithToken = { ...userData, token: tokens.accessToken };
          setUser(userWithToken);

          return { success: true };
        } catch (offlineErr) {
          const message = 'Offline signup failed. Try again.';
          setError(message);
          return { success: false, error: message };
        }
      }

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
