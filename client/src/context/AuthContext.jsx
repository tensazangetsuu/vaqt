import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vaqt_token');
    if (token) {
      api.businesses.me()
        .then(setBusiness)
        .catch(() => localStorage.removeItem('vaqt_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, business } = await api.auth.login({ email, password });
    localStorage.setItem('vaqt_token', token);
    setBusiness(business);
    return business;
  };

  const register = async (data) => {
    const { token, business } = await api.auth.register(data);
    localStorage.setItem('vaqt_token', token);
    setBusiness(business);
    return business;
  };

  const logout = () => {
    localStorage.removeItem('vaqt_token');
    setBusiness(null);
  };

  const updateBusiness = (updated) => setBusiness(updated);

  return (
    <AuthContext.Provider value={{ business, loading, login, register, logout, updateBusiness }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
