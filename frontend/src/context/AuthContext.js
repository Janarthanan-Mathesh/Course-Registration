import React, { createContext, useState, useContext } from 'react';
import { apiPost, apiGet, apiPut } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const loadProfile = async (sessionToken) => {
    const data = await apiGet('/users/me', sessionToken);
    return data.user;
  };

  const login = async (
    email,
    password,
    selectedRole = 'user',
    firebaseIdToken = '',
    adminDevOtp = ''
  ) => {
    setIsAuthLoading(true);
    try {
      const data = await apiPost('/auth/login', { email, password, firebaseIdToken, adminDevOtp });
      if (selectedRole && data.user.role !== selectedRole) {
        throw new Error(`This account is ${data.user.role}. Please use ${data.user.role} login.`);
      }
      const fullProfile = await loadProfile(data.token);
      setUser({
        id: fullProfile._id,
        ...fullProfile,
      });
      setToken(data.token);
      setIsLoggedIn(true);
      return data;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (formData) => {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      linkedinLink: formData.linkedin,
      githubLink: formData.github,
      role: formData.role || 'user',
    };
    return apiPost('/auth/register', payload);
  };

  const verifyEmailOtp = async (userId, otp) => {
    return apiPost('/auth/verify-email', { userId, otp });
  };


  const applySession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    setIsLoggedIn(Boolean(sessionToken && sessionUser));
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const fullProfile = await loadProfile(token);
    setUser({
      id: fullProfile._id,
      ...fullProfile,
    });
    return fullProfile;
  };

  const updateProfile = async (payload) => {
    if (!token) throw new Error('Not logged in');
    const data = await apiPut('/users/me', payload, token);
    setUser((prev) => ({ ...prev, ...data.user }));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isAuthLoading,
        login,
        register,
        verifyEmailOtp,
        applySession,
        refreshProfile,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
