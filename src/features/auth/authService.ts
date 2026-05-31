import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@react-native-firebase/auth';

import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  source: 'demo' | 'firebase';
  isAdmin?: boolean;
};

function getDisplayName(email: string | null | undefined) {
  return email?.split('@')[0] || 'Listener';
}

export function toAppUser(firebaseUser: {
  uid: string;
  email: string | null;
}): AppUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || 'user@spotifyclone.app',
    displayName: getDisplayName(firebaseUser.email),
    source: 'firebase',
  };
}

export function createDemoUser(email: string): AppUser {
  return {
    id: 'demo-user',
    email,
    displayName: getDisplayName(email),
    source: 'demo',
  };
}

export async function loginWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured()) {
    return createDemoUser(email);
  }

  const auth = getAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return toAppUser(credential.user);
}

export async function registerWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured()) {
    return createDemoUser(email);
  }

  const auth = getAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return toAppUser(credential.user);
}

export async function logoutFromAuth() {
  if (isFirebaseConfigured()) {
    await signOut(getAuth());
  }
}

export function subscribeToAuthState(
  onChange: (user: AppUser | null) => void,
) {
  if (!isFirebaseConfigured()) {
    return () => undefined;
  }

  return onAuthStateChanged(getAuth(), firebaseUser => {
    onChange(firebaseUser ? toAppUser(firebaseUser) : null);
  });
}
