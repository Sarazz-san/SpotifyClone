import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {IconButton} from '../../components/IconButton';
import {usePlayer} from './PlayerContext';

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack,
    duration,
    isCurrentTrackLiked,
    isPlaying,
    repeatMode,
    isShuffleEnabled,
    next,
    playbackError,
    playbackStatus,
    playTrack,
    playQueue,
    position,
    previous,
    seekBy,
    toggleLike,
    togglePlayback,
    toggleRepeat,
    toggleShuffle,
    queue,
  } = usePlayer();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  // Calculer les prochains titres basés sur la queue
  const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  const upNext = queue.slice(currentIndex + 1, currentIndex + 4);

  return (
    <LinearGradient
      colors={['#535353', colors.backgroundDeep, colors.background]}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconButton
            name="chevron-down"
            onPress={() => navigation.goBack()}
            variant="plain"
            color={colors.white}
          />
          <Text style={styles.headerText}>Now playing</Text>
          <Icon
            color={playbackStatus === 'ready' ? colors.primary : colors.textMuted}
            name={playbackStatus === 'loading' ? 'cloud-sync' : 'dots-horizontal'}
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
            color={isCurrentTrackLiked ? colors.primary : colors.white}
            name={isCurrentTrackLiked ? 'heart' : 'heart-outline'}
            onPress={toggleLike}
            variant="plain"
            size={32}
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
            size={28}
          />
          <IconButton 
            name="skip-previous" 
            onPress={previous} 
            size={42} 
            variant="plain" 
            color={colors.white}
          />
          <Pressable onPress={togglePlayback} style={styles.playButton}>
            <Icon
              color={colors.black}
              name={isPlaying ? 'pause' : 'play'}
              size={42}
            />
          </Pressable>
          <IconButton 
            name="skip-next" 
            onPress={next} 
            size={42} 
            variant="plain" 
            color={colors.white}
          />
          <IconButton
            color={repeatMode !== 'off' ? colors.primary : colors.textMuted}
            name={repeatMode === 'one' ? 'repeat-once' : 'repeat'}
            onPress={toggleRepeat}
            variant="plain"
            size={28}
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

        {upNext.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Up next</Text>
            {upNext.map(track => (
              <Pressable
                key={track.id}
                onPress={() => playQueue(queue, queue.indexOf(track))}
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
              </Pressable>
            ))}
          </View>
        )}
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About {currentTrack.artist}</Text>
          <Text style={styles.infoText}>
            Lecture synchronisée avec le mini-player, les favoris et l’historique
            Firestore. Design optimisé pour l'expérience Spotify originale.
          </Text>
        </View>
      </ScrollView>
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
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverFrame: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xl,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 15,
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
    fontSize: 24,
    fontWeight: '900',
  },
  artist: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  playButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: colors.white,
  },
  seekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  seekButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  seekText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  infoCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: spacing.xl,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  queueRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  queueCover: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  queueText: {
    flex: 1,
  },
  queueTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  queueArtist: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
