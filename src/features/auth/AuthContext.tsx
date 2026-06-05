import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {AppUser} from './authService';
import {
  loginWithEmail,
  logoutFromAuth,
  registerWithEmail,
  subscribeToAuthState,
} from './authService';
import {getUserProfile, upsertUserProfile} from '../user/userService';

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async firebaseUser => {
      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.id);
          setUser({...firebaseUser, ...profile});
          upsertUserProfile(firebaseUser).catch(() => undefined);
        } else {
          setUser(null);
        }
      } finally {
        setIsInitializing(false);
      }
    });

    // if subscribeToAuthState returns an empty function (unconfigured),
    // we should immediately stop initializing
    if (unsubscribe.toString().includes('undefined')) {
      setIsInitializing(false);
    }

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isInitializing,
      error,
      login: async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const loggedUser = await loginWithEmail(email, password);
          const profile = await getUserProfile(loggedUser.id);
          const fullUser = {...loggedUser, ...profile};
          setUser(fullUser);
          await upsertUserProfile(fullUser);
        } catch (authError) {
          setError(
            authError instanceof Error
              ? authError.message
              : 'Connexion impossible',
          );
        } finally {
          setIsLoading(false);
        }
      },
      register: async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const registeredUser = await registerWithEmail(email, password);
          setUser(registeredUser);
          await upsertUserProfile(registeredUser);
        } catch (authError) {
          setError(
            authError instanceof Error
              ? authError.message
              : 'Creation du compte impossible',
          );
        } finally {
          setIsLoading(false);
        }
      },
      logout: async () => {
        await logoutFromAuth();
        setUser(null);
      },
    }),
    [error, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
