import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost, apiGet, apiPut } from '../services/api';

const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'course_registration_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const persistSession = async (sessionToken, sessionUser) => {
    if (!sessionToken || !sessionUser) return;
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: sessionToken, user: sessionUser })
    );
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const loadProfile = async (sessionToken) => {
    const data = await apiGet('/users/me', sessionToken);
    return data.user;
  };

  const login = async (
    email,
    password,
    selectedRole = 'student',
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
      await persistSession(data.token, { id: fullProfile._id, ...fullProfile });
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
      role: formData.role || 'student',
      adminDevOtp: formData.adminDevOtp || '',
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
    persistSession(sessionToken, sessionUser).catch(() => {});
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
    const updatedUser = { ...user, ...data.user };
    setUser(updatedUser);
    await persistSession(token, updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    try {
      await clearSession();
    } catch (_) {
      // ignore storage cleanup failures
    }
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (!parsed?.token) return;

        const fullProfile = await loadProfile(parsed.token);
        if (!mounted) return;

        const restoredUser = { id: fullProfile._id, ...fullProfile };
        setToken(parsed.token);
        setUser(restoredUser);
        setIsLoggedIn(true);
        await persistSession(parsed.token, restoredUser);
      } catch (_) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
        }
        await clearSession();
      } finally {
        if (mounted) setIsSessionReady(true);
      }
    };

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isAuthLoading,
        isSessionReady,
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
