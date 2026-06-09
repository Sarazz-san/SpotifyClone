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
  } = usePlayer();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

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
          {playbackStatus === 'loading' ? 'Loading...' : currentTrack.artist}
        </Text>
      </View>
      <Icon color={colors.primary} name="cellphone-sound" size={24} />
      <IconButton 
        name="heart-outline" 
        variant="plain" 
        color={colors.textMuted}
      />
      <IconButton
        name={isPlaying ? 'pause' : 'play'}
        onPress={togglePlayback}
        variant="plain"
        color={colors.white}
        size={32}
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
    left: spacing.sm,
    right: spacing.sm,
    bottom: 76,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  textStack: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  artist: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  progressTrack: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
});
