import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryChip({label, active = false, onPress}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, active ? styles.activeLabel : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
  },
  active: {
    backgroundColor: colors.primary,
  },
  inactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pressed: {
    transform: [{scale: 0.96}],
  },
  label: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: '800',
  },
  activeLabel: {
    color: colors.white,
  },
});
