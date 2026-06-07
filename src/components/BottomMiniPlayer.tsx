import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import {usePlayer} from '../features/player/PlayerContext';
import {IconButton} from './IconButton';

export function BottomMiniPlayer() {
  const navigation = useNavigation();
  const {
    currentTrack,
    duration,
    isPlaying,
    playbackStatus,
    position,
    togglePlayback,
    isCurrentTrackLiked,
    toggleLike,
    closePlayer,
    showMiniPlayer,
  } = usePlayer();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  // Don't show if hidden by user or no track loaded
  if (!showMiniPlayer || currentTrack.id === 'empty-catalog-track') {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('Player' as never)}
      style={styles.container}>
      <Image source={currentTrack.cover} style={styles.cover} />
      <View style={styles.textStack}>
        <Text numberOfLines={1} style={styles.title}>
          {currentTrack.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {playbackStatus === 'loading' ? 'Loading audio' : 'Wired Connection'}
        </Text>
      </View>
      <Icon color={colors.primary} name="cellphone-sound" size={24} />
      <IconButton 
        name={isCurrentTrackLiked ? 'heart' : 'heart-outline'} 
        color={isCurrentTrackLiked ? colors.primary : colors.text}
        onPress={toggleLike}
        variant="plain" 
      />
      <IconButton
        name={isPlaying ? 'pause' : 'play'}
        onPress={togglePlayback}
        variant="plain"
      />
      <IconButton
        name="close"
        onPress={closePlayer}
        variant="plain"
      />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 76,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#3c1f62',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
  },
  textStack: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
  },
  artist: {
    color: colors.primary,
    fontSize: typography.label,
    marginTop: 2,
  },
  progressTrack: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
});
