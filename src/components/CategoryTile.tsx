import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {colors} from '../constants/colors';
import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import type {Category} from '../features/catalog/catalogService';

type Props = {
  item: Category;
  index: number;
  onPress?: () => void;
};

const gradients = [
  ['#a855f7', '#581c87'],
  ['#eb4d89', '#7b2448'],
  ['#2d8cff', '#17406f'],
  ['#f59e0b', '#804d05'],
  ['#8b5cf6', '#3b236a'],
  ['#14b8a6', '#0f5d55'],
];

export function CategoryTile({index, item, onPress}: Props) {
  const gradient = item.color ? [item.color, item.color] : gradients[index % gradients.length];

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <Text numberOfLines={2} style={styles.label}>
          {item.name}
        </Text>
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{uri: item.imageUrl}} style={styles.image} />
          ) : (
            <Text style={styles.mark}>♪</Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 104,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    marginBottom: spacing.md,
  },
  pressed: {
    transform: [{scale: 0.98}],
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
    width: '70%',
  },
  imageContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    transform: [{rotate: '25deg'}],
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
  },
  mark: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 40,
    fontWeight: '900',
  },
});
