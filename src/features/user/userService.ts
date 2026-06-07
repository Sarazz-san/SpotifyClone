import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  query,
} from '@react-native-firebase/firestore';

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
  playedAt?: ReturnType<typeof serverTimestamp>;
  likedAt?: ReturnType<typeof serverTimestamp>;
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

function getDb() {
  return getFirestore();
}

export async function upsertUserProfile(user: AppUser) {
  if (!isFirebaseConfigured() || user.source !== 'firebase') {
    return;
  }

  const db = getDb();
  await setDoc(
    doc(collection(db, firebaseCollections.users), user.id),
    cleanObject({
      email: user.email,
      displayName: user.displayName,
      updatedAt: serverTimestamp(),
    }),
    {merge: true},
  );
}

export async function getUserProfile(userId: string): Promise<Partial<AppUser> | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const db = getDb();
  const snapshot = await getDoc(
    doc(collection(db, firebaseCollections.users), userId),
  );

  return snapshot.exists() ? (snapshot.data() as Partial<AppUser>) : null;
}

export async function saveRecentlyPlayed(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !track.id) {
    return;
  }

  const db = getDb();
  await setDoc(
    doc(
      collection(doc(collection(db, firebaseCollections.users), user.id), firebaseCollections.recentlyPlayed),
      track.id,
    ),
    cleanObject({
      ...toTrackPayload(track),
      playedAt: serverTimestamp(),
    }),
    {merge: true},
  );
}

export async function saveLikedTrack(user: AppUser | null, track: Track) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !track.id) {
    return;
  }

  const db = getDb();
  await setDoc(
    doc(
      collection(doc(collection(db, firebaseCollections.users), user.id), firebaseCollections.likedTracks),
      track.id,
    ),
    cleanObject({
      ...toTrackPayload(track),
      likedAt: serverTimestamp(),
    }),
    {merge: true},
  );
}

export async function removeLikedTrack(user: AppUser | null, trackId: string) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase' || !trackId) {
    return;
  }

  const db = getDb();
  await deleteDoc(
    doc(
      collection(doc(collection(db, firebaseCollections.users), user.id), firebaseCollections.likedTracks),
      trackId,
    ),
  );
}

export async function toggleLikeTrack(
  userId: string,
  trackId: string,
  isLiked: boolean,
) {
  if (!isFirebaseConfigured() || !userId || !trackId) {
    return;
  }

  const db = getDb();
  const trackDoc = doc(
    collection(doc(collection(db, firebaseCollections.users), userId), firebaseCollections.likedTracks),
    trackId,
  );

  if (isLiked) {
    await deleteDoc(trackDoc);
    return;
  }

  await setDoc(trackDoc, {likedAt: serverTimestamp()}, {merge: true});
}

export async function saveSearchQuery(userId: string, queryText: string) {
  const normalizedQuery = queryText.trim();

  if (!isFirebaseConfigured() || !userId || !normalizedQuery) {
    return;
  }

  const db = getDb();
  await setDoc(
    doc(
      collection(doc(collection(db, firebaseCollections.users), userId), 'searchHistory'),
      normalizedQuery,
    ),
    {
      query: normalizedQuery,
      searchedAt: serverTimestamp(),
    },
  );
}

export async function deleteSearchQuery(userId: string, queryText: string) {
  const normalizedQuery = queryText.trim();

  if (!isFirebaseConfigured() || !userId || !normalizedQuery) {
    return;
  }

  const db = getDb();
  await deleteDoc(
    doc(
      collection(doc(collection(db, firebaseCollections.users), userId), 'searchHistory'),
      normalizedQuery,
    ),
  );
}

export function subscribeToSearchHistory(
  userId: string,
  onChange: (history: string[]) => void,
) {
  if (!isFirebaseConfigured() || !userId) {
    onChange([]);
    return () => {};
  }

  const db = getDb();
  const q = query(
    collection(doc(collection(db, firebaseCollections.users), userId), 'searchHistory'),
    orderBy('searchedAt', 'desc'),
    limit(10),
  );

  return onSnapshot(q, snapshot => {
    onChange(
      snapshot.docs
        .map(document => document.data().query)
        .filter((q): q is string => typeof q === 'string'),
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

  const db = getDb();
  return onSnapshot(
    collection(doc(collection(db, firebaseCollections.users), user.id), firebaseCollections.likedTracks),
    snapshot => {
      onChange(snapshot.docs.map(document => document.id));
    },
  );
}

export function subscribeToRecentlyPlayed(
  user: AppUser | null,
  onChange: (tracks: Track[]) => void,
) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    onChange([]);
    return () => {};
  }

  const db = getDb();
  const q = query(
    collection(doc(collection(db, firebaseCollections.users), user.id), firebaseCollections.recentlyPlayed),
    orderBy('playedAt', 'desc'),
    limit(20),
  );

  return onSnapshot(q, snapshot => {
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

export async function toggleFollowArtist(
  user: AppUser | null,
  artist: {id: string; name: string; image: string},
  isFollowed: boolean,
) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    return;
  }

  const db = getDb();
  const artistDoc = doc(
    collection(doc(collection(db, firebaseCollections.users), user.id), 'followedArtists'),
    artist.id,
  );

  if (isFollowed) {
    await deleteDoc(artistDoc);
  } else {
    await setDoc(artistDoc, {
      name: artist.name,
      image: artist.image,
      followedAt: serverTimestamp(),
    });
  }
}

export function subscribeToFollowedArtists(
  user: AppUser | null,
  onChange: (artists: {id: string; name: string; image: string}[]) => void,
) {
  if (!isFirebaseConfigured() || user?.source !== 'firebase') {
    onChange([]);
    return () => {};
  }

  const db = getDb();
  const q = query(
    collection(doc(collection(db, firebaseCollections.users), user.id), 'followedArtists'),
    orderBy('followedAt', 'desc'),
  );

  return onSnapshot(q, snapshot => {
    onChange(
      snapshot.docs.map(docu => ({
        id: docu.id,
        name: docu.data().name,
        image: docu.data().image,
      }))
    );
  });
}
