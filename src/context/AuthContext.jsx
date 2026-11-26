import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { setUnauthorizedHandler, tokenStore } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get())); // restoring a session?
  const [sessionExpired, setSessionExpired] = useState(false);

  const applySession = useCallback((data) => {
    setUser(data.user);
    setProfile(data.profile);
  }, []);

  // When the API says "401" the token is no longer valid: forget it everywhere.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (tokenStore.get()) setSessionExpired(true);
      tokenStore.clear();
      setUser(null);
      setProfile(null);
    });
  }, []);

  // On page refresh, use the stored token to restore the session.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authService
      .getMe()
      .then((res) => applySession(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, [applySession]);

  const login = useCallback(
    async (email, password) => {
      const res = await authService.login(email, password);
      tokenStore.set(res.data.token);
      setSessionExpired(false);
      applySession(res.data);
      return res.data.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authService.register(payload);
      tokenStore.set(res.data.token);
      setSessionExpired(false);
      applySession(res.data);
      return res.data.user;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* the token is cleared locally either way */
    }
    tokenStore.clear();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const res = await authService.getMe();
    applySession(res.data);
  }, [applySession]);

  const value = useMemo(
    () => ({ user, profile, loading, sessionExpired, login, register, logout, refreshProfile }),
    [user, profile, loading, sessionExpired, login, register, logout, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
