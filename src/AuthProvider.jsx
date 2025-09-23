import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    auth.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    await auth.login(email, password);
    const u = await auth.me();
    setUser(u);
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, login, logout, checking }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
