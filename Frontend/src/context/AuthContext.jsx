import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ─── 1. Load user & token from localStorage on initial render ────────────────
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('leadflow_auth_user');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed.token) {
          setToken(parsed.token);
          setUser({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role: parsed.role,
          });
        }
      }
    } catch (err) {
      console.error('Failed to parse auth data from localStorage:', err);
      localStorage.removeItem('leadflow_auth_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── 2. Login function ───────────────────────────────────────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim(),
      password: password.trim(),
    });

    if (response.data && response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;

      // Save to state
      setToken(receivedToken);
      setUser(receivedUser);

      // Save to localStorage
      localStorage.setItem(
        'leadflow_auth_user',
        JSON.stringify({
          token: receivedToken,
          id: receivedUser.id,
          name: receivedUser.name,
          email: receivedUser.email,
          role: receivedUser.role,
          loginTime: new Date().toISOString(),
        })
      );

      // Role-based redirection
      if (receivedUser.role === 'admin') {
        navigate('/admin');
      } else if (receivedUser.role === 'sales_person') {
        navigate('/salesperson/dashboard');
      } else {
        navigate('/manager/dashboard');
      }

      return response.data;
    }

    throw new Error(response.data?.message || 'Login failed');
  };

  // ─── 3. Logout function ──────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('leadflow_auth_user');
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
    navigate('/login');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom Hook to consume AuthContext easily ─────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;