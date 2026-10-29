import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authRepository } from '@/features/auth/data/auth-repository';
import type { AppUser } from '@/features/auth/domain/auth';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AppUser>;
  recoverPassword: (email: string) => Promise<{ message: string }>;
  updateProfile: (input: { name: string; phone: string }) => Promise<AppUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const currentUser = await authRepository.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        await refresh();
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh().catch(() => {
        setUser(null);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await authRepository.login(email, password);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const nextUser = await authRepository.register(input);
      setUser(nextUser);
      return nextUser;
    },
    [],
  );

  const recoverPassword = useCallback(async (email: string) => {
    return authRepository.recoverPassword(email);
  }, []);

  const updateProfile = useCallback(async (input: { name: string; phone: string }) => {
    const nextUser = await authRepository.updateProfile(input);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await authRepository.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      recoverPassword,
      updateProfile,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, recoverPassword, updateProfile, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
