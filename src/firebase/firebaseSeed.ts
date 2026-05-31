import firestore from '@react-native-firebase/firestore';

import {categories, playlists, tracks} from '../data/mockCatalog';
import {firebaseCollections} from './firebaseCollections';
import {isFirebaseConfigured} from './firebaseAvailability';

export async function seedDemoCatalog() {
  if (!isFirebaseConfigured()) {
    return false;
  }

  try {
    const batch = firestore().batch();

    tracks.forEach(track => {
      batch.set(
        firestore().collection(firebaseCollections.tracks).doc(track.id),
        {
          title: track.title,
          artist: track.artist,
          album: track.album,
          durationMs: track.durationMs,
          audioUrl: track.audioUrl,
          coverUrl: `https://picsum.photos/seed/${track.id}/400/400`,
        },
      );
    });

    playlists.forEach(playlist => {
      batch.set(
        firestore().collection(firebaseCollections.playlists).doc(playlist.id),
        {
          title: playlist.title,
          subtitle: playlist.subtitle,
          trackIds: playlist.trackIds,
          category: playlist.category,
          pinned: playlist.pinned || false,
          coverUrl: `https://picsum.photos/seed/${playlist.id}/400/400`,
        },
      );
    });

    categories.forEach((category, index) => {
      batch.set(
        firestore()
          .collection(firebaseCollections.categories)
          .doc(`category_${index}`),
        {
          name: category,
        },
      );
    });

    await batch.commit();
    return true;
  } catch {
    return false;
  }
}
