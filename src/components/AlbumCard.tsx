import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import type {Playlist} from '../models/Playlist';
import type {Track} from '../models/Track';

type Props = {
  item: Playlist | Track;
  subtitle?: string;
  onPress?: () => void;
};

export function AlbumCard({item, subtitle, onPress}: Props) {
  const description =
    subtitle || ('artist' in item ? item.artist : item.subtitle);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <Image source={item.cover} style={styles.cover} />
      <View style={styles.textStack}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 148,
  },
  pressed: {
    transform: [{scale: 0.97}],
  },
  cover: {
    width: 148,
    height: 148,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
  },
  textStack: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.label,
    lineHeight: 17,
    marginTop: 2,
  },
});
