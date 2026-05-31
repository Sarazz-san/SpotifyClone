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

type PlayerContextValue = {
  currentTrack: Track;
  duration: number;
  isCurrentTrackLiked: boolean;
  isPlaying: boolean;
  isRepeatEnabled: boolean;
  isShuffleEnabled: boolean;
  playbackError: string | null;
  playbackStatus: PlaybackStatus;
  position: number;
  hasPlayableAudio: boolean;
  next: () => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
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
  const {tracks} = useCatalog();
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0] || emptyTrack);
  const [duration, setDuration] = useState(currentTrack.durationMs / 1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [position, setPosition] = useState(0);
  const hasPlayableAudio = Boolean(currentTrack.audioUrl);
  const isCurrentTrackLiked = likedTrackIds.includes(currentTrack.id);

  useEffect(() => {
    if (!tracks.length) {
      setCurrentTrack(emptyTrack);
      setDuration(0);
      setPosition(0);
      setIsPlaying(false);
      return;
    }

    if (!tracks.some(track => track.id === currentTrack.id)) {
      const nextTrack = tracks[0];
      setCurrentTrack(nextTrack);
      setDuration(nextTrack.durationMs / 1000);
      setPosition(0);
      setIsPlaying(false);
    }
  }, [currentTrack.id, tracks]);

  useEffect(() => subscribeToLikedTrackIds(user, setLikedTrackIds), [user]);

  const playTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    setDuration(track.durationMs / 1000);
    setPlaybackError(null);
    setPlaybackStatus(track.audioUrl ? 'loading' : 'error');
    setPosition(0);
    setIsPlaying(Boolean(track.audioUrl));
    await saveRecentlyPlayed(user, track);
  }, [user]);

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
    setIsRepeatEnabled(currentValue => !currentValue);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled(currentValue => !currentValue);
  }, []);

  const next = useCallback(async () => {
    if (!tracks.length) {
      return;
    }

    if (isShuffleEnabled && tracks.length > 1) {
      const candidates = tracks.filter(track => track.id !== currentTrack.id);
      const randomIndex = Math.floor(Math.random() * candidates.length);
      await playTrack(candidates[randomIndex]);
      return;
    }

    const index = tracks.findIndex(track => track.id === currentTrack.id);
    const nextTrack = tracks[(index + 1) % tracks.length];
    await playTrack(nextTrack);
  }, [currentTrack.id, isShuffleEnabled, playTrack, tracks]);

  const previous = useCallback(async () => {
    if (!tracks.length) {
      return;
    }

    if (position > 3) {
      seekTo(0);
      return;
    }

    const index = tracks.findIndex(track => track.id === currentTrack.id);
    const previousIndex = index <= 0 ? tracks.length - 1 : index - 1;
    await playTrack(tracks[previousIndex]);
  }, [currentTrack.id, playTrack, position, seekTo, tracks]);

  const handleLoad = useCallback((data: OnLoadData) => {
    setDuration(data.duration || currentTrack.durationMs / 1000);
    setPlaybackError(null);
    setPlaybackStatus('ready');
  }, [currentTrack.durationMs]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setPosition(data.currentTime);
  }, []);

  const handleEnd = useCallback(() => {
    if (isRepeatEnabled) {
      seekTo(0);
      setIsPlaying(true);
      return;
    }

    next();
  }, [isRepeatEnabled, next, seekTo]);

  const handleError = useCallback(() => {
    setIsPlaying(false);
    setPlaybackStatus('error');
    setPlaybackError(
      'Lecture impossible. Vérifiez votre connexion internet.',
    );
  }, []);

  const value = useMemo(
    () => ({
      currentTrack,
      duration,
      isCurrentTrackLiked,
      isPlaying,
      isRepeatEnabled,
      isShuffleEnabled,
      playbackError,
      playbackStatus,
      position,
      hasPlayableAudio,
      next,
      playTrack,
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
      isRepeatEnabled,
      isShuffleEnabled,
      next,
      playTrack,
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
          playWhenInactive
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
