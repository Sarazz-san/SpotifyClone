import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Video, {
  type OnLoadData,
  type OnProgressData,
  type VideoRef,
} from 'react-native-video';

import type {Track} from '../../models/Track';
import {useAuth} from '../auth/AuthContext';
import {useCatalog} from '../catalog/CatalogContext';
import {
  removeLikedTrack,
  saveLikedTrack,
  saveRecentlyPlayed,
  subscribeToLikedTrackIds,
} from '../user/userService';

type PlaybackStatus = 'idle' | 'loading' | 'ready' | 'error';
export type RepeatMode = 'off' | 'all' | 'one';

type PlayerContextValue = {
  currentTrack: Track;
  duration: number;
  isCurrentTrackLiked: boolean;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  isShuffleEnabled: boolean;
  playbackError: string | null;
  playbackStatus: PlaybackStatus;
  position: number;
  hasPlayableAudio: boolean;
  queue: Track[];
  next: () => Promise<void>;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  previous: () => Promise<void>;
  seekBy: (offset: number) => void;
  seekTo: (time: number) => void;
  toggleLike: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
const fallbackCover = require('../../assets/images/logo_spotify_green.png');

const emptyTrack: Track = {
  id: 'empty-catalog-track',
  title: 'Aucun titre disponible',
  artist: 'Connectez-vous pour voir le contenu',
  album: 'Catalogue vide',
  durationMs: 0,
  cover: fallbackCover,
  audioUrl: '',
};

export function PlayerProvider({children}: {children: React.ReactNode}) {
  const audioRef = useRef<VideoRef>(null);
  const {user} = useAuth();
  const {tracks: catalogTracks} = useCatalog();
  
  const [currentTrack, setCurrentTrack] = useState<Track>(catalogTracks[0] || emptyTrack);
  const [queue, setQueue] = useState<Track[]>(catalogTracks.length > 0 ? catalogTracks : []);
  const [duration, setDuration] = useState(currentTrack.durationMs / 1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [position, setPosition] = useState(0);
  
  const hasPlayableAudio = Boolean(currentTrack.audioUrl);
  const isCurrentTrackLiked = likedTrackIds.includes(currentTrack.id);

  // Sync with catalog if empty or track disappears
  useEffect(() => {
    if (!catalogTracks.length) {
      if (currentTrack.id !== emptyTrack.id) {
        setCurrentTrack(emptyTrack);
        setQueue([]);
        setDuration(0);
        setPosition(0);
        setIsPlaying(false);
      }
      return;
    }

    // If current track is empty but catalog has tracks, pick the first one
    if (currentTrack.id === emptyTrack.id && catalogTracks.length > 0) {
      const firstTrack = catalogTracks[0];
      setCurrentTrack(firstTrack);
      setQueue(catalogTracks);
      setDuration(firstTrack.durationMs / 1000);
    }
  }, [catalogTracks, currentTrack.id]);

  useEffect(() => subscribeToLikedTrackIds(user, setLikedTrackIds), [user]);

  const playTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    if (newQueue) {
      setQueue(newQueue);
    } else if (queue.length === 0) {
      setQueue([track]);
    }
    
    setDuration(track.durationMs / 1000);
    setPlaybackError(null);
    setPlaybackStatus(track.audioUrl ? 'loading' : 'error');
    setPosition(0);
    setIsPlaying(Boolean(track.audioUrl));
    await saveRecentlyPlayed(user, track);
  }, [user, queue.length]);

  const playQueue = useCallback(async (tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    const trackToPlay = tracks[startIndex] || tracks[0];
    await playTrack(trackToPlay, tracks);
  }, [playTrack]);

  const togglePlayback = useCallback(async () => {
    if (!hasPlayableAudio) {
      setPlaybackStatus('error');
      setPlaybackError('Ce titre ne possède pas encore de fichier audio.');
      return;
    }
    setIsPlaying(currentValue => !currentValue);
  }, [hasPlayableAudio]);

  const seekTo = useCallback((time: number) => {
    const nextPosition = Math.max(0, Math.min(time, duration));
    audioRef.current?.seek(nextPosition);
    setPosition(nextPosition);
  }, [duration]);

  const seekBy = useCallback((offset: number) => {
    setPosition(currentPosition => {
      const nextPosition = Math.max(0, Math.min(currentPosition + offset, duration));
      audioRef.current?.seek(nextPosition);
      return nextPosition;
    });
  }, [duration]);

  const toggleLike = useCallback(async () => {
    if (isCurrentTrackLiked) {
      setLikedTrackIds(trackIds =>
        trackIds.filter(trackId => trackId !== currentTrack.id),
      );
      await removeLikedTrack(user, currentTrack.id);
      return;
    }

    setLikedTrackIds(trackIds => [...trackIds, currentTrack.id]);
    await saveLikedTrack(user, currentTrack);
  }, [currentTrack, isCurrentTrackLiked, user]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(current => {
      if (current === 'off') return 'all';
      if (current === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled(currentValue => !currentValue);
  }, []);

  const next = useCallback(async () => {
    const activeQueue = queue.length > 0 ? queue : catalogTracks;
    if (!activeQueue.length) return;

    if (isShuffleEnabled && activeQueue.length > 1) {
      const candidates = activeQueue.filter(track => track.id !== currentTrack.id);
      const randomIndex = Math.floor(Math.random() * candidates.length);
      await playTrack(candidates[randomIndex]);
      return;
    }

    const index = activeQueue.findIndex(track => track.id === currentTrack.id);
    if (index === -1) {
      await playTrack(activeQueue[0]);
    } else if (index < activeQueue.length - 1) {
      await playTrack(activeQueue[index + 1]);
    } else if (repeatMode === 'all') {
      await playTrack(activeQueue[0]);
    } else {
      setIsPlaying(false);
      setPosition(0);
    }
  }, [currentTrack.id, isShuffleEnabled, playTrack, queue, catalogTracks, repeatMode]);

  const previous = useCallback(async () => {
    if (position > 3) {
      seekTo(0);
      return;
    }

    const activeQueue = queue.length > 0 ? queue : catalogTracks;
    if (!activeQueue.length) return;

    const index = activeQueue.findIndex(track => track.id === currentTrack.id);
    if (index === -1) {
      await playTrack(activeQueue[0]);
    } else if (index > 0) {
      await playTrack(activeQueue[index - 1]);
    } else if (repeatMode === 'all') {
      await playTrack(activeQueue[activeQueue.length - 1]);
    } else {
      seekTo(0);
    }
  }, [currentTrack.id, playTrack, position, seekTo, queue, catalogTracks, repeatMode]);

  const handleLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration || currentTrack.durationMs / 1000);
    setPlaybackError(null);
    setPlaybackStatus('ready');
  }, [currentTrack.durationMs]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setPosition(data.currentTime);
  }, []);

  const handleEnd = useCallback(() => {
    if (repeatMode === 'one') {
      seekTo(0);
      setIsPlaying(true);
      return;
    }
    next();
  }, [repeatMode, next, seekTo]);

  const handleError = useCallback(() => {
    setIsPlaying(false);
    setPlaybackStatus('error');
    setPlaybackError(
      'Lecture impossible. Vérifiez votre fichier audio.',
    );
  }, []);

  const value = useMemo(
    () => ({
      currentTrack,
      duration,
      isCurrentTrackLiked,
      isPlaying,
      repeatMode,
      isShuffleEnabled,
      playbackError,
      playbackStatus,
      position,
      hasPlayableAudio,
      queue,
      next,
      playTrack,
      playQueue,
      previous,
      seekBy,
      seekTo,
      toggleLike,
      togglePlayback,
      toggleRepeat,
      toggleShuffle,
    }),
    [
      currentTrack,
      duration,
      hasPlayableAudio,
      isCurrentTrackLiked,
      isPlaying,
      repeatMode,
      isShuffleEnabled,
      next,
      playTrack,
      playQueue,
      playbackError,
      playbackStatus,
      position,
      previous,
      seekBy,
      seekTo,
      toggleLike,
      togglePlayback,
      toggleRepeat,
      toggleShuffle,
      queue,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {hasPlayableAudio ? (
        <Video
          audioOnly
          ignoreSilentSwitch="ignore"
          onAudioBecomingNoisy={() => setIsPlaying(false)}
          onEnd={handleEnd}
          onError={handleError}
          onLoad={handleLoad}
          onProgress={handleProgress}
          paused={!isPlaying}
          playInBackground
          progressUpdateInterval={500}
          ref={audioRef}
          source={{uri: currentTrack.audioUrl}}
          style={styles.hiddenAudio}
        />
      ) : null}
      {children}
    </PlayerContext.Provider>
  );
}

const styles = {
  hiddenAudio: {
    height: 0,
    opacity: 0,
    width: 0,
  },
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used inside PlayerProvider');
  }
  return context;
}
