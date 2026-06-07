import { getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from '@react-native-firebase/auth';

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
  displayName?: string | null;
}): AppUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || 'user@spotifyclone.app',
    displayName: firebaseUser.displayName || getDisplayName(firebaseUser.email),
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

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  if (!isFirebaseConfigured()) {
    return createDemoUser(email);
  }

  const auth = getAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  // Save displayName to Firebase user profile
  if (displayName) {
    await updateProfile(credential.user, {displayName});
  }
  return toAppUser({...credential.user, displayName: displayName || credential.user.displayName});
}

export async function logoutFromAuth() {
  if (isFirebaseConfigured()) {
    await signOut(getAuth());
  }
}

export async function resetPassword(email: string) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase non configuré');
  }
  await sendPasswordResetEmail(getAuth(), email);
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
