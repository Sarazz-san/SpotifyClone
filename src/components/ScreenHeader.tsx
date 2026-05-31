import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../constants/colors';
import {spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import {IconButton} from './IconButton';

type HeaderAction = {
  icon: string;
  onPress?: () => void;
};

type Props = {
  title: string;
  eyebrow?: string;
  actions?: HeaderAction[];
};

export function ScreenHeader({actions = [], eyebrow, title}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleStack}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actions.length ? (
        <View style={styles.actions}>
          {actions.map(action => (
            <IconButton
              key={action.icon}
              name={action.icon}
              onPress={action.onPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  titleStack: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.label,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
