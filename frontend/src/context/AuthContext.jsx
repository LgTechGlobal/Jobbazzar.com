import React, { createContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jb_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jb_token');
      try {
        const res = await api.get('/auth/me');
        setUserInfo(res.data.data);
        localStorage.setItem('jb_user', JSON.stringify(res.data.data));
      } catch (error) {
        // Not logged in or invalid token
        if (!token) {
          setUserInfo(null);
          localStorage.removeItem('jb_user');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const user = res.data.data;
    setUserInfo(user);
    if (user.token) {
      localStorage.setItem('jb_token', user.token);
    }
    localStorage.setItem('jb_user', JSON.stringify(user));
    return user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const user = res.data.data;
    setUserInfo(user);
    if (user.token) {
      localStorage.setItem('jb_token', user.token);
    }
    localStorage.setItem('jb_user', JSON.stringify(user));
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('jb_token');
      localStorage.removeItem('jb_user');
      setUserInfo(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
