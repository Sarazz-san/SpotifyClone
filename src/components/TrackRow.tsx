import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import type {Playlist} from '../models/Playlist';
import type {Track} from '../models/Track';
import {IconButton} from './IconButton';

type Props = {
  item: Track | Playlist;
  meta?: string;
  roundCover?: boolean;
  trailingIcon?: string;
  onPress?: () => void;
};

export function TrackRow({
  item,
  meta,
  roundCover = false,
  trailingIcon = 'plus',
  onPress,
}: Props) {
  const description =
    meta || ('artist' in item ? `${item.artist} - ${item.album}` : item.subtitle);

  const imageSource = typeof item.cover === 'number' 
    ? item.cover 
    : {uri: (item as any).coverUrl || (item as any).cover?.uri};

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <Image
        source={imageSource}
        style={[styles.cover, roundCover ? styles.roundCover : null]}
      />
      <View style={styles.textStack}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {description}
        </Text>
      </View>
      <IconButton name={trailingIcon} onPress={onPress} variant="plain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    transform: [{scale: 0.98}],
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
  },
  roundCover: {
    borderRadius: radius.full,
  },
  textStack: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 3,
  },
});
