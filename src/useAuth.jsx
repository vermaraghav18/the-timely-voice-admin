// admin/src/useAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../../shared/api/index.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out, {} = logged in
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await auth.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    await auth.login(email, password);
    const me = await auth.me();
    setUser(me);
  };

  const logout = async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return (
    useContext(AuthCtx) || {
      user: undefined,
      loading: true,
      login: async () => {},
      logout: async () => {},
    }
  );
}
