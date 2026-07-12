import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hts_user') || 'null'); }
    catch { return null; }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem('hts_token', token);
    localStorage.setItem('hts_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hts_token');
    localStorage.removeItem('hts_user');
    setUser(null);
  }, []);

  const isLoggedIn = !!user && !!localStorage.getItem('hts_token');

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}
