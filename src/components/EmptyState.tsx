import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({message, title}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
});
