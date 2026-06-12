import { getFirestore, collection, query, limit, getDocs } from '@react-native-firebase/firestore';

import {firebaseCollections} from '../../firebase/firebaseCollections';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';
import type {Playlist} from '../../models/Playlist';
import type {Track} from '../../models/Track';

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  color?: string;
};

export type Catalog = {
  categories: Category[];
  playlists: Playlist[];
  tracks: Track[];
  source: 'demo' | 'firebase';
  statusMessage: string;
};

const emptyFirebaseCatalog: Catalog = {
  categories: [],
  playlists: [],
  tracks: [],
  source: 'firebase',
  statusMessage:
    'Connexion établie, mais aucun contenu n’est disponible pour le moment.',
};

type FirestoreTrack = {
  title?: string;
  artist?: string;
  album?: string;
  durationMs?: number;
  coverUrl?: string;
  audioUrl?: string;
  genre?: string;
  userId?: string;
  type?: 'music' | 'podcast';
};

type FirestorePlaylist = {
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  trackIds?: string[];
  category?: Playlist['category'];
  pinned?: boolean;
  ownerId?: string | null;
};

const defaultCover = require('../../assets/images/logo_spotify_green.png');

export const emptyCatalog: Catalog = {
  categories: [],
  playlists: [],
  tracks: [],
  source: 'firebase',
  statusMessage: 'Chargement...',
};

function mapTrack(id: string, data: FirestoreTrack): Track {
  return {
    id,
    title: data.title || 'Untitled track',
    artist: data.artist || 'Unknown artist',
    album: data.album || 'Single',
    durationMs: data.durationMs || 180000,
    cover: data.coverUrl ? {uri: data.coverUrl} : defaultCover,
    audioUrl: data.audioUrl || '',
    genre: data.genre,
    userId: data.userId,
    type: data.type || 'music',
  };
}

function mapPlaylist(id: string, data: FirestorePlaylist): Playlist {
  return {
    id,
    title: data.title || 'Untitled playlist',
    subtitle: data.subtitle || 'Playlist',
    cover: data.coverUrl ? {uri: data.coverUrl} : defaultCover,
    trackIds: data.trackIds || [],
    category: data.category || 'playlist',
    pinned: !!data.pinned,
    ownerId: data.ownerId ?? null,
  };
}

export async function loadCatalog(userId?: string): Promise<Catalog> {
  if (!isFirebaseConfigured()) {
    return emptyFirebaseCatalog;
  }

  try {
    const db = getFirestore();
    
    const [tracksSnapshot, playlistsSnapshot, categoriesSnapshot] =
      await Promise.all([
        getDocs(query(collection(db, firebaseCollections.tracks), limit(100))),
        getDocs(query(collection(db, firebaseCollections.playlists), limit(50))),
        getDocs(query(collection(db, firebaseCollections.categories), limit(50))),
      ]);

    const allTracks = tracksSnapshot.docs.map(document =>
      mapTrack(document.id, document.data() as FirestoreTrack),
    );

    // Public tracks (no userId or userId is null) + current user's tracks
    const firebaseTracks = allTracks.filter(track => 
      !track.userId || track.userId === userId
    );

    const allPlaylists = playlistsSnapshot.docs.map(document =>
      mapPlaylist(document.id, document.data() as FirestorePlaylist),
    );

    // Public playlists (no ownerId) + playlists owned by the current user
    const firebasePlaylists = allPlaylists.filter(playlist =>
      !playlist.ownerId || playlist.ownerId === userId,
    );

    const firebaseCategories = categoriesSnapshot.docs
      .map(document => ({
        id: document.id,
        name: document.data().name as string,
        imageUrl: document.data().imageUrl as string | undefined,
        color: document.data().color as string | undefined,
      }))
      .filter(cat => !!cat.name);

    if (!firebaseTracks.length) {
      return {
        ...emptyFirebaseCatalog,
        categories: firebaseCategories,
      };
    }

    return {
      categories: firebaseCategories,
      playlists: firebasePlaylists,
      tracks: firebaseTracks,
      source: 'firebase',
      statusMessage: 'Catalogue chargé avec succès.',
    };
  } catch (error) {
    return {
      ...emptyFirebaseCatalog,
      statusMessage:
        error instanceof Error
          ? `Erreur de connexion: ${error.message}`
          : 'Erreur de connexion: impossible de charger le contenu.',
    };
  }
}
