import firestore from '@react-native-firebase/firestore';

import {firebaseCollections} from '../../firebase/firebaseCollections';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';
import type {Track} from '../../models/Track';
import type {AppUser} from '../auth/authService';

type TrackHistoryPayload = {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  audioUrl?: string;
  playedAt?: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  likedAt?: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
};

function cleanObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;
}

function toTrackPayload(track: Track): Omit<TrackHistoryPayload, 'playedAt' | 'likedAt'> {
  return cleanObject({
    trackId: track.id,
    title: track.title || 'Untitled track',
    artist: track.artist || 'Unknown artist',
    album: track.album || 'Single',
    audioUrl: track.audioUrl || undefined,
  }) as Omit<TrackHistoryPayload, 'playedAt' | 'likedAt'>;
}

export async function upsertUserProfile(user: AppUser) {
  if (!isFirebaseConfigured() || user.source !== 'firebase') {
    return;
  }

  await firestore().collection(firebaseCollections.users).doc(user.id).set(
    cleanObject({
      email: user.email,
      displayName: user.displayName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    }),
    {merge: true},
  );
}

export async function getUserProfile(userId: string): Promise<Partial<AppUser> | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const snapshot = await firestore()
    .collection(firebaseCollections.users)
    .doc(userId)
    .get();

  return snapshot.exists() ? (snapshot.data() as Partial<AppUser>) : null;
}

export async function saveRecentlyPlayed(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !track.id) {
    return;
  }

  await firestore()
    .collection(firebaseCollections.users)
    .doc(user.id)
    .collection(firebaseCollections.recentlyPlayed)
    .doc(track.id)
    .set(
      cleanObject({
        ...toTrackPayload(track),
        playedAt: firestore.FieldValue.serverTimestamp(),
      }),
      {merge: true},
    );
}

export async function saveLikedTrack(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !track.id) {
    return;
  }

  await firestore()
    .collection(firebaseCollections.users)
    .doc(user.id)
    .collection(firebaseCollections.likedTracks)
    .doc(track.id)
    .set(
      cleanObject({
        ...toTrackPayload(track),
        likedAt: firestore.FieldValue.serverTimestamp(),
      }),
      {merge: true},
    );
}

export async function removeLikedTrack(user: AppUser | null, trackId: string) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !trackId) {
    return;
  }

  await firestore()
    .collection(firebaseCollections.users)
    .doc(user.id)
    .collection(firebaseCollections.likedTracks)
    .doc(trackId)
    .delete();
}

export async function toggleLikeTrack(
  userId: string,
  trackId: string,
  isLiked: boolean,
) {
  if (!isFirebaseConfigured() || !userId || !trackId) {
    return;
  }

  const document = firestore()
    .collection(firebaseCollections.users)
    .doc(userId)
    .collection(firebaseCollections.likedTracks)
    .doc(trackId);

  if (isLiked) {
    await document.delete();
    return;
  }

  await document.set({likedAt: firestore.FieldValue.serverTimestamp()}, {merge: true});
}

export async function saveSearchQuery(userId: string, queryText: string) {
  const normalizedQuery = queryText.trim();

  if (!isFirebaseConfigured() || !userId || !normalizedQuery) {
    return;
  }

  await firestore()
    .collection(firebaseCollections.users)
    .doc(userId)
    .collection('searchHistory')
    .doc(normalizedQuery)
    .set({
      query: normalizedQuery,
      searchedAt: firestore.FieldValue.serverTimestamp(),
    });
}

export async function deleteSearchQuery(userId: string, queryText: string) {
  const normalizedQuery = queryText.trim();

  if (!isFirebaseConfigured() || !userId || !normalizedQuery) {
    return;
  }

  await firestore()
    .collection(firebaseCollections.users)
    .doc(userId)
    .collection('searchHistory')
    .doc(normalizedQuery)
    .delete();
}

export function subscribeToSearchHistory(
  userId: string,
  onChange: (history: string[]) => void,
) {
  if (!isFirebaseConfigured() || !userId) {
    onChange([]);
    return () => {};
  }

  return firestore()
    .collection(firebaseCollections.users)
    .doc(userId)
    .collection('searchHistory')
    .orderBy('searchedAt', 'desc')
    .limit(10)
    .onSnapshot(snapshot => {
      onChange(
        snapshot.docs
          .map(document => document.data().query)
          .filter((query): query is string => typeof query === 'string'),
      );
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

  return firestore()
    .collection(firebaseCollections.users)
    .doc(user.id)
    .collection(firebaseCollections.likedTracks)
    .onSnapshot(snapshot => {
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

  return firestore()
    .collection(firebaseCollections.users)
    .doc(user.id)
    .collection(firebaseCollections.recentlyPlayed)
    .orderBy('playedAt', 'desc')
    .limit(20)
    .onSnapshot(snapshot => {
      onChange(
        snapshot.docs.map(document => {
          const data = document.data();
          return {
            id: document.id,
            title: typeof data.title === 'string' ? data.title : 'Untitled track',
            artist: typeof data.artist === 'string' ? data.artist : 'Unknown artist',
            album: typeof data.album === 'string' ? data.album : 'Single',
            durationMs: 0,
            cover: require('../../assets/images/logo_spotify_green.png'),
            audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : '',
          };
        }),
      );
    });
}
