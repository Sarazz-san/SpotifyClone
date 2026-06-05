import { getFirestore, collection, query, limit, getDocs } from '@react-native-firebase/firestore';

import {siteCategories, playlists, tracks} from '../../data/mockCatalog';
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
};

type FirestorePlaylist = {
  title?: string;
  subtitle?: string;
  coverUrl?: string;
  trackIds?: string[];
  category?: Playlist['category'];
  pinned?: boolean;
};

export const demoCatalog: Catalog = {
  categories: siteCategories.map((name, i) => ({ id: `cat-${i}`, name })),
  playlists,
  tracks,
  source: 'demo',
  statusMessage: 'Contenu local chargé.',
};

export const emptyCatalog: Catalog = {
  categories: [],
  playlists: [],
  tracks: [],
  source: 'demo',
  statusMessage: 'Chargement...',
};

function mapTrack(id: string, data: FirestoreTrack): Track {
  return {
    id,
    title: data.title || 'Untitled track',
    artist: data.artist || 'Unknown artist',
    album: data.album || 'Single',
    durationMs: data.durationMs || 180000,
    cover: data.coverUrl ? {uri: data.coverUrl} : tracks[0].cover,
    audioUrl: data.audioUrl || '',
    genre: (data as any).genre,
  };
}

function mapPlaylist(id: string, data: FirestorePlaylist): Playlist {
  return {
    id,
    title: data.title || 'Untitled playlist',
    subtitle: data.subtitle || 'Playlist',
    cover: data.coverUrl ? {uri: data.coverUrl} : playlists[0].cover,
    trackIds: data.trackIds || [],
    category: data.category || 'playlist',
    pinned: !!data.pinned,
  };
}

export async function loadCatalog(): Promise<Catalog> {
  if (!isFirebaseConfigured()) {
    return demoCatalog;
  }

  try {
    const db = getFirestore();
    const [tracksSnapshot, playlistsSnapshot, categoriesSnapshot] =
      await Promise.all([
        getDocs(query(collection(db, firebaseCollections.tracks), limit(50))),
        getDocs(query(collection(db, firebaseCollections.playlists), limit(50))),
        getDocs(query(collection(db, firebaseCollections.categories), limit(50))),
      ]);

    const firebaseTracks = tracksSnapshot.docs.map(document =>
      mapTrack(document.id, document.data() as FirestoreTrack),
    );
    const firebasePlaylists = playlistsSnapshot.docs.map(document =>
      mapPlaylist(document.id, document.data() as FirestorePlaylist),
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
        categories: firebaseCategories.length ? firebaseCategories : demoCatalog.categories,
      };
    }

    return {
      categories: firebaseCategories.length ? firebaseCategories : demoCatalog.categories,
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
