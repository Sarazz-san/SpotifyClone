import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../constants/colors';
import {radius} from '../constants/spacing';

type Props = {
  name: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'filled' | 'plain';
};

export function IconButton({
  color = colors.text,
  disabled = false,
  name,
  onPress,
  size = 22,
  variant = 'ghost',
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      hitSlop={10}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        variant === 'filled' && styles.filled,
        variant === 'plain' && styles.plain,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Icon color={color} name={name} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filled: {
    backgroundColor: colors.primary,
  },
  plain: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    transform: [{scale: 0.94}],
  },
});
