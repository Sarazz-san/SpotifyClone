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
  likedTrackIds: string[];
  showMiniPlayer: boolean;
  next: () => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  closePlayer: () => void;
  previous: () => Promise<void>;
  seekBy: (offset: number) => void;
  seekTo: (time: number) => void;
  toggleLike: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  upNext: Track[];
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
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  const hasPlayableAudio = Boolean(currentTrack.audioUrl);
  const isCurrentTrackLiked = likedTrackIds.includes(currentTrack.id);

  useEffect(() => {
    if (!tracks.length) {
      setCurrentTrack(emptyTrack);
      setDuration(0);
      setPosition(0);
      setIsPlaying(false);
      setShowMiniPlayer(false);
      return;
    }

    // If the current track is the empty placeholder, do not auto-select a track
    if (currentTrack.id === emptyTrack.id) {
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
    setShowMiniPlayer(true);
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

  const closePlayer = useCallback(() => {
    setIsPlaying(false);
    setShowMiniPlayer(false);
    setCurrentTrack(emptyTrack);
    setPosition(0);
    setPlaybackStatus('idle');
  }, []);

  const seekTo = useCallback((time: number) => {
    if (currentTrack.id === emptyTrack.id) return;
    const nextPosition = Math.max(0, Math.min(time, duration));
    audioRef.current?.seek(nextPosition);
    setPosition(nextPosition);
  }, [currentTrack.id, duration]);

  const seekBy = useCallback((offset: number) => {
    if (currentTrack.id === emptyTrack.id) return;
    setPosition(currentPosition => {
      const nextPosition = Math.max(0, Math.min(currentPosition + offset, duration));
      audioRef.current?.seek(nextPosition);
      return nextPosition;
    });
  }, [currentTrack.id, duration]);

  const toggleLike = useCallback(async () => {
    if (currentTrack.id === emptyTrack.id) return;
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
    if (!tracks.length || currentTrack.id === emptyTrack.id) {
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
    if (!tracks.length || currentTrack.id === emptyTrack.id) {
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
    if (currentTrack.id === emptyTrack.id) return;
    setDuration(data.duration || currentTrack.durationMs / 1000);
    setPlaybackError(null);
    setPlaybackStatus('ready');
  }, [currentTrack.id, currentTrack.durationMs]);

  const handleProgress = useCallback((data: OnProgressData) => {
    if (currentTrack.id === emptyTrack.id) return;
    setPosition(data.currentTime);
  }, [currentTrack.id]);

  const handleEnd = useCallback(() => {
    if (currentTrack.id === emptyTrack.id) return;
    if (isRepeatEnabled) {
      seekTo(0);
      setIsPlaying(true);
      return;
    }

    next();
  }, [currentTrack.id, isRepeatEnabled, next, seekTo]);

  const handleError = useCallback(() => {
    if (currentTrack.id === emptyTrack.id) return;
    setIsPlaying(false);
    setPlaybackStatus('error');
    setPlaybackError(
      'Lecture impossible. Vérifiez votre connexion internet.',
    );
  }, [currentTrack.id]);

  const upNext = useMemo(() => {
    if (!tracks.length || currentTrack.id === emptyTrack.id) return [];
    if (isShuffleEnabled) {
      // Just take some random tracks that are not current for visual purpose
      return tracks.filter(t => t.id !== currentTrack.id).sort(() => Math.random() - 0.5).slice(0, 3);
    }
    const index = tracks.findIndex(t => t.id === currentTrack.id);
    if (index === -1) return tracks.slice(0, 3);
    return tracks.slice(index + 1).concat(tracks.slice(0, index)).slice(0, 3);
  }, [tracks, currentTrack.id, isShuffleEnabled]);

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
      likedTrackIds,
      showMiniPlayer,
      next,
      playTrack,
      closePlayer,
      previous,
      seekBy,
      seekTo,
      toggleLike,
      togglePlayback,
      toggleRepeat,
      toggleShuffle,
      upNext,
    }),
    [
      currentTrack,
      duration,
      hasPlayableAudio,
      likedTrackIds,
      isCurrentTrackLiked,
      isPlaying,
      isRepeatEnabled,
      isShuffleEnabled,
      showMiniPlayer,
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
      upNext,
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
