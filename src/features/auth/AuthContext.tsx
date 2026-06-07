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
import {friendlyError} from '../../utils/errorMessages';

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase isn't configured, immediately exit init state
    if (!subscribeToAuthState) {
      setIsInitializing(false);
      return;
    }

    const unsubscribe = subscribeToAuthState(async firebaseUser => {
      try {
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.id);
          setUser({...firebaseUser, ...profile});
          upsertUserProfile(firebaseUser).catch(() => undefined);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    });

    // subscribeToAuthState returns () => undefined if Firebase isn't configured
    if (!unsubscribe || unsubscribe === (() => undefined)) {
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
          setError(friendlyError(authError, 'Connexion impossible'));
        } finally {
          setIsLoading(false);
        }
      },
      register: async (email: string, password: string, displayName?: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const registeredUser = await registerWithEmail(email, password, displayName);
          setUser(registeredUser);
          await upsertUserProfile(registeredUser);
        } catch (authError) {
          setError(friendlyError(authError, 'Création du compte impossible'));
        } finally {
          setIsLoading(false);
        }
      },
      logout: async () => {
        try {
          await logoutFromAuth();
        } catch {
          // Silent logout failure – still clear local user
        }
        setUser(null);
      },
    }),
    [error, isInitializing, isLoading, user],
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
