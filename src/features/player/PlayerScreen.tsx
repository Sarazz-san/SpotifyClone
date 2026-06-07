import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {IconButton} from '../../components/IconButton';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from './PlayerContext';
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';
import {Track} from '../../models/Track';

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerScreen() {
  const navigation = useNavigation();
  const {tracks} = useCatalog();
  const {
    currentTrack,
    duration,
    isCurrentTrackLiked,
    isPlaying,
    isRepeatEnabled,
    isShuffleEnabled,
    next,
    playbackError,
    playbackStatus,
    playTrack,
    position,
    previous,
    seekBy,
    toggleLike,
    togglePlayback,
    toggleRepeat,
    toggleShuffle,
    upNext,
  } = usePlayer();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null);

  return (
    <LinearGradient
      colors={[colors.surfaceHighest, colors.backgroundDeep, colors.background]}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton
            name="chevron-down"
            onPress={() => navigation.goBack()}
            variant="plain"
          />
          <Text style={styles.headerText}>Now playing</Text>
          <Icon
            color={playbackStatus === 'ready' ? colors.primary : colors.textMuted}
            name={playbackStatus === 'loading' ? 'cloud-sync' : 'cloud-check'}
            size={24}
          />
        </View>

        <View style={styles.coverFrame}>
          <Image source={currentTrack.cover} style={styles.cover} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Text style={styles.title}>{currentTrack.title}</Text>
            <Text style={styles.artist}>{currentTrack.artist}</Text>
          </View>
          <IconButton
            color={colors.textMuted}
            name="playlist-plus"
            onPress={() => setSelectedTrack(currentTrack)}
            variant="plain"
          />
          <IconButton
            color={isCurrentTrackLiked ? colors.primary : colors.textMuted}
            name={isCurrentTrackLiked ? 'heart' : 'heart-outline'}
            onPress={toggleLike}
            variant="plain"
          />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
        {playbackError ? (
          <Text style={styles.errorText}>{playbackError}</Text>
        ) : null}

        <View style={styles.controls}>
          <IconButton
            color={isShuffleEnabled ? colors.primary : colors.textMuted}
            name="shuffle"
            onPress={toggleShuffle}
            variant="plain"
          />
          <IconButton name="skip-previous" onPress={previous} size={34} variant="plain" />
          <Pressable onPress={togglePlayback} style={styles.playButton}>
            <Icon
              color={colors.black}
              name={isPlaying ? 'pause' : 'play'}
              size={34}
            />
          </Pressable>
          <IconButton name="skip-next" onPress={next} size={34} variant="plain" />
          <IconButton
            color={isRepeatEnabled ? colors.primary : colors.textMuted}
            name="repeat"
            onPress={toggleRepeat}
            variant="plain"
          />
        </View>

        <View style={styles.seekRow}>
          <Pressable onPress={() => seekBy(-15)} style={styles.seekButton}>
            <Icon color={colors.text} name="rewind-15" size={22} />
            <Text style={styles.seekText}>15s</Text>
          </Pressable>
          <Pressable onPress={() => seekBy(15)} style={styles.seekButton}>
            <Text style={styles.seekText}>15s</Text>
            <Icon color={colors.text} name="fast-forward-15" size={22} />
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Up next</Text>
          {upNext.map(track => (
            <Pressable
              key={track.id}
              onPress={() => playTrack(track)}
              style={styles.queueRow}>
              <Image source={track.cover} style={styles.queueCover} />
              <View style={styles.queueText}>
                <Text numberOfLines={1} style={styles.queueTitle}>
                  {track.title}
                </Text>
                <Text numberOfLines={1} style={styles.queueArtist}>
                  {track.artist}
                </Text>
              </View>
              {track.id === currentTrack.id ? (
                <Icon color={colors.primary} name="volume-high" size={20} />
              ) : (
                <Pressable onPress={() => setSelectedTrack(track)} style={{padding: spacing.xs}}>
                  <Icon color={colors.textMuted} name="dots-vertical" size={24} />
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About {currentTrack.artist}</Text>
          <Text style={styles.infoText}>
            Lecture synchronisée avec le mini-player, les favoris et l’historique
            Firestore.
          </Text>
        </View>
      </ScrollView>

      <AddToPlaylistModal 
        visible={!!selectedTrack}
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: colors.textMuted,
    fontSize: typography.label,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  coverFrame: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  cover: {
    width: '82%',
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: radius.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  meta: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
  },
  artist: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 5,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHighest,
    marginTop: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  time: {
    color: colors.textMuted,
    fontSize: typography.label,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: typography.label,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.label,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  playButton: {
    minWidth: 88,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },
  seekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  seekButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  seekText: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: spacing.xl,
  },
  infoTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  queueRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  queueCover: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  queueText: {
    flex: 1,
  },
  queueTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
  },
  queueArtist: {
    color: colors.textMuted,
    fontSize: typography.label,
    marginTop: 2,
  },
});
