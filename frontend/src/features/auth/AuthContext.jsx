import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    const userRes = await api.get('/auth/me/');
    setUser(userRes.data);
  };

  const register = async (username, email, password, password_confirm) => {
    await api.post('/auth/register/', { username, email, password, password_confirm });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
