import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../api/http.js';
import { fetchMe, login as loginApi, register as registerApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, if we have a token, hydrate the current user.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((me) => setUser(me))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const { user: u, token } = await loginApi(credentials);
    setToken(token);
    setUser(u);
  }

  async function register(data) {
    const { user: u, token } = await registerApi(data);
    setToken(token);
    setUser(u);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
