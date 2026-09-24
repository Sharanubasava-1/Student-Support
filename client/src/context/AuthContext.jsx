import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  STUDENT: { email: 'student@edumerge.com', password: 'password123', label: 'Rahul Sharma (Student)' },
  STUDENT2: { email: 'student2@edumerge.com', password: 'password123', label: 'Ananya Patel (Student)' },
  STAFF_HOSTEL: { email: 'agent.hostel@edumerge.com', password: 'password123', label: 'Vikram Singh (Hostel Warden)' },
  STAFF_IT: { email: 'agent.it@edumerge.com', password: 'password123', label: 'Rajesh Kumar (IT Admin)' },
  STAFF_ACADEMICS: { email: 'agent.academics@edumerge.com', password: 'password123', label: 'Dr. Priya Nair (Academics)' },
  ADMIN: { email: 'admin@edumerge.com', password: 'password123', label: 'Sanjay Mehta (Support Head/Admin)' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edumerge_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Session verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('edumerge_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (accountDetails) => {
    const res = await API.post('/auth/register', {
      ...accountDetails,
      role: 'STUDENT'
    });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('edumerge_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const switchUser = async (demoKey) => {
    const account = DEMO_ACCOUNTS[demoKey] || DEMO_ACCOUNTS.STUDENT;
    try {
      await login(account.email, account.password);
    } catch (err) {
      console.error('Failed demo switch:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('edumerge_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchUser, DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
