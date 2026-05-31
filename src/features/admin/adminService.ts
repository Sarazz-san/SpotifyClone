import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs, updateDoc, arrayUnion, arrayRemove, serverTimestamp, query, limit } from '@react-native-firebase/firestore';
import {firebaseCollections} from '../../firebase/firebaseCollections';
import {AppUser} from '../auth/authService';

/**
 * Uploads a file to Cloudinary using their unsigned REST API.
 */
export async function uploadToCloudinary(
  fileUri: string,
  resourceType: 'auto' | 'image' | 'video' = 'auto',
  onProgress?: (progress: number) => void
): Promise<string> {
  const CLOUD_NAME = 'dii6ojs37';
  const UPLOAD_PRESET = 'spotify_clone_upload';

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: resourceType === 'image' ? 'image/jpeg' : 'audio/mpeg',
    name: resourceType === 'image' ? 'cover.jpg' : 'track.mp3',
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      if (response.secure_url) {
        resolve(response.secure_url);
      } else {
        reject(new Error(response.error?.message || 'Upload failed'));
      }
    };

    xhr.onerror = (e) => reject(e);
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded / event.total);
      };
    }
    xhr.send(formData);
  });
}

export async function createTrack(trackData: {
  title: string;
  artist: string;
  album: string;
  category: string;
  audioUrl: string;
  coverUrl: string;
  durationMs: number;
}) {
  const db = getFirestore();
  const newTrackRef = doc(collection(db, firebaseCollections.tracks));
  await setDoc(newTrackRef, {
    ...trackData,
    id: newTrackRef.id,
    createdAt: serverTimestamp(),
  });
  return newTrackRef.id;
}

export async function deleteTrack(trackId: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, firebaseCollections.tracks, trackId));
}

export async function getStats() {
  const db = getFirestore();
  const [tracks, playlists, users, categories] = await Promise.all([
    getDocs(collection(db, firebaseCollections.tracks)),
    getDocs(collection(db, firebaseCollections.playlists)),
    getDocs(collection(db, firebaseCollections.users)),
    getDocs(collection(db, firebaseCollections.categories)),
  ]);

  return {
    tracks: tracks.size,
    playlists: playlists.size,
    users: users.size,
    categories: categories.size,
  };
}

export async function getCategories(): Promise<{id: string; name: string}[]> {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, firebaseCollections.categories));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
  }));
}

export async function addCategory(name: string) {
  const db = getFirestore();
  await setDoc(doc(collection(db, firebaseCollections.categories)), {
    name,
    createdAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, firebaseCollections.categories, id));
}

export async function createPlaylist(playlistData: {
  title: string;
  subtitle: string;
  category: string;
  coverUrl: string;
}) {
  const db = getFirestore();
  const newPlaylistRef = doc(collection(db, firebaseCollections.playlists));
  await setDoc(newPlaylistRef, {
    ...playlistData,
    id: newPlaylistRef.id,
    trackIds: [],
    pinned: false,
    createdAt: serverTimestamp(),
  });
  return newPlaylistRef.id;
}

export async function deletePlaylist(id: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, firebaseCollections.playlists, id));
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const db = getFirestore();
  await updateDoc(doc(db, firebaseCollections.playlists, playlistId), {
    trackIds: arrayUnion(trackId),
  });
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const db = getFirestore();
  await updateDoc(doc(db, firebaseCollections.playlists, playlistId), {
    trackIds: arrayRemove(trackId),
  });
}

export async function getUsers(): Promise<AppUser[]> {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, firebaseCollections.users));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as AppUser));
}

export async function setAdminStatus(userId: string, isAdmin: boolean) {
  const db = getFirestore();
  await updateDoc(doc(db, firebaseCollections.users, userId), {
    isAdmin,
  });
}

export async function createArtist(artistData: {name: string, coverUrl: string}) {
  const db = getFirestore();
  await setDoc(doc(collection(db, 'artists')), {
    ...artistData,
    createdAt: serverTimestamp(),
  });
}
