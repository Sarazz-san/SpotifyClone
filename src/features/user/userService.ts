import firestore, { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp, onSnapshot, query, orderBy, limit, deleteDoc } from '@react-native-firebase/firestore';

import {firebaseCollections} from '../../firebase/firebaseCollections';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';
import type {Track} from '../../models/Track';
import type {AppUser} from '../auth/authService';

export async function upsertUserProfile(user: AppUser) {
  if (!isFirebaseConfigured() || user.source !== 'firebase') {
    return;
  }

  const db = getFirestore();
  await setDoc(doc(db, firebaseCollections.users, user.id), {
    email: user.email,
    displayName: user.displayName,
    updatedAt: serverTimestamp(),
  }, {merge: true});
}

export async function getUserProfile(userId: string): Promise<Partial<AppUser> | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const db = getFirestore();
  const snapshot = await getDoc(doc(db, firebaseCollections.users, userId));
  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() as Partial<AppUser>;
}

export async function saveRecentlyPlayed(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    return;
  }

  const db = getFirestore();
  await setDoc(doc(collection(doc(db, firebaseCollections.users, user.id), firebaseCollections.recentlyPlayed), track.id), {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    playedAt: serverTimestamp(),
  }, {merge: true});
}

export async function saveLikedTrack(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    return;
  }

  const db = getFirestore();
  await setDoc(doc(collection(doc(db, firebaseCollections.users, user.id), firebaseCollections.likedTracks), track.id), {
    trackId: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    likedAt: serverTimestamp(),
  }, {merge: true});
}

export async function removeLikedTrack(user: AppUser | null, trackId: string) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    return;
  }

  const db = getFirestore();
  await deleteDoc(doc(doc(db, firebaseCollections.users, user.id), firebaseCollections.likedTracks, trackId));
}

export async function toggleLikeTrack(userId: string, trackId: string, isLiked: boolean) {
  if (!isFirebaseConfigured()) return;

  const db = getFirestore();
  const docRef = doc(doc(db, firebaseCollections.users, userId), firebaseCollections.likedTracks, trackId);

  if (isLiked) {
    await deleteDoc(docRef);
  } else {
    await setDoc(docRef, {
      likedAt: serverTimestamp(),
    });
  }
}

export async function saveSearchQuery(userId: string, queryText: string) {
  if (!isFirebaseConfigured()) return;
  
  const db = getFirestore();
  await setDoc(doc(doc(db, firebaseCollections.users, userId), 'searchHistory', queryText), {
    query: queryText,
    searchedAt: serverTimestamp(),
  });
}

export async function deleteSearchQuery(userId: string, queryText: string) {
  if (!isFirebaseConfigured()) return;
  const db = getFirestore();
  await deleteDoc(doc(doc(db, firebaseCollections.users, userId), 'searchHistory', queryText));
}

export function subscribeToSearchHistory(userId: string, onChange: (history: string[]) => void) {
  if (!isFirebaseConfigured()) return () => {};

  const db = getFirestore();
  const q = query(
    collection(doc(db, firebaseCollections.users, userId), 'searchHistory'),
    orderBy('searchedAt', 'desc'),
    limit(10)
  );

  return onSnapshot(q, snapshot => {
    onChange(snapshot.docs.map(document => document.data().query));
  });
}

export function subscribeToLikedTrackIds(
  user: AppUser | null,
  onChange: (trackIds: string[]) => void,
) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    onChange([]);
    return () => {};
  }

  const db = getFirestore();
  const colRef = collection(doc(db, firebaseCollections.users, user.id), firebaseCollections.likedTracks);

  return onSnapshot(colRef, snapshot => {
    onChange(snapshot.docs.map(document => document.id));
  });
}

export function subscribeToRecentlyPlayed(
  user: AppUser | null,
  onChange: (tracks: Track[]) => void,
) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    onChange([]);
    return () => {};
  }

  const db = getFirestore();
  const q = query(
    collection(doc(db, firebaseCollections.users, user.id), firebaseCollections.recentlyPlayed),
    orderBy('playedAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, snapshot => {
    const tracks = snapshot.docs.map(document => document.data() as Track);
    onChange(tracks);
  });
}
