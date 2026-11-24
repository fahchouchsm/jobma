import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  type AuthResponse,
  type AuthUser,
  deleteAccountOnServer,
  fetchCurrentUser,
  loginWithEmail,
  loginWithGoogle,
  logoutFromServer,
  type MeResponse,
  onUnauthorized,
  registerWithEmail,
} from '@/services/auth-service';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthHydrated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  lastAuthResponse: AuthResponse | null;
  meMeta: Pick<
    MeResponse,
    'hasCompletedOnboarding' | 'isProfileComplete' | 'missingProfileFields'
  > | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogleToken: (idToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setUserAvatar: (avatarUrl: string) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastAuthResponse, setLastAuthResponse] = useState<AuthResponse | null>(null);
  const [meMeta, setMeMeta] = useState<AuthContextValue['meMeta']>(null);

  useEffect(() => {
    let mounted = true;
    fetchCurrentUser()
      .then((me) => {
        if (mounted && me) {
          setUser(me.user);
          setMeMeta({
            hasCompletedOnboarding: me.hasCompletedOnboarding,
            isProfileComplete: me.isProfileComplete,
            missingProfileFields: me.missingProfileFields,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsAuthHydrated(true);
      });

    const unsubscribe = onUnauthorized(() => {
      if (mounted) {
        setUser(null);
        setLastAuthResponse(null);
        setMeMeta(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginWithEmail({ email: email.trim(), password });
      setUser(res.user);
      setLastAuthResponse(res);
      setMeMeta({
        hasCompletedOnboarding: res.hasCompletedOnboarding,
        isProfileComplete: res.isProfileComplete,
        missingProfileFields: res.missingProfileFields,
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connexion impossible';
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await registerWithEmail({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setUser(res.user);
      setLastAuthResponse(res);
      setMeMeta({
        hasCompletedOnboarding: res.hasCompletedOnboarding,
        isProfileComplete: res.isProfileComplete,
        missingProfileFields: res.missingProfileFields,
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Inscription impossible';
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginWithGoogle(idToken);
      setUser(res.user);
      setLastAuthResponse(res);
      setMeMeta({
        hasCompletedOnboarding: res.hasCompletedOnboarding,
        isProfileComplete: res.isProfileComplete,
        missingProfileFields: res.missingProfileFields,
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connexion Google impossible';
      setAuthError(msg);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutFromServer();
    setUser(null);
    setLastAuthResponse(null);
    setMeMeta(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      await deleteAccountOnServer();
      setUser(null);
      setLastAuthResponse(null);
      setMeMeta(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const setUserAvatar = useCallback((avatarUrl: string) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl } : prev));
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAuthHydrated,
        isAuthLoading,
        authError,
        lastAuthResponse,
        meMeta,
        login,
        register,
        loginWithGoogleToken,
        logout,
        deleteAccount,
        setUserAvatar,
        clearAuthError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
