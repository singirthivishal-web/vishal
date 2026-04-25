import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('careeros_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (authToken) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const loginWithToken = useCallback((newToken) => {
    localStorage.setItem('careeros_token', newToken);
    setToken(newToken);
  }, []);

  // For email/password if we wanted to implement it later via backend
  const login = useCallback(async (email, password) => {
    // Currently fallback if social login isn't used
    const userData = { email, name: email.split('@')[0] };
    setUser(userData);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('careeros_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: Boolean(user), loading, login, loginWithToken, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
