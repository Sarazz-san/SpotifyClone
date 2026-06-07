import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {radius, spacing} from '../constants/spacing';
import {typography} from '../constants/typography';
import type {Category} from '../features/catalog/catalogService';

// Spotify-like curated color pairs [primary, darker shade]
const PALETTE: [string, string][] = [
  ['#a855f7', '#6b21a8'],
  ['#e8115b', '#9e0f40'],
  ['#2563eb', '#1e3a8a'],
  ['#f59e0b', '#92400e'],
  ['#10b981', '#065f46'],
  ['#ec4899', '#831843'],
  ['#6366f1', '#3730a3'],
  ['#14b8a6', '#134e4a'],
  ['#f97316', '#7c2d12'],
  ['#8b5cf6', '#4c1d95'],
  ['#84cc16', '#365314'],
  ['#ef4444', '#7f1d1d'],
  ['#06b6d4', '#164e63'],
  ['#d946ef', '#701a75'],
  ['#22c55e', '#14532d'],
  ['#3b82f6', '#1e3a8a'],
];

// Icon to display per category name
const CATEGORY_ICONS: Record<string, string> = {
  music: 'music-note',
  podcasts: 'podcast',
  'hip-hop': 'microphone',
  electronic: 'lightning-bolt',
  pop: 'star',
  'r&b': 'heart',
  indie: 'guitar-electric',
  'made for you': 'account-heart',
  'new releases': 'new-box',
  focus: 'brain',
  chill: 'weather-night',
  party: 'party-popper',
  workout: 'dumbbell',
  jazz: 'saxophone',
  classical: 'violin',
  latin: 'music-clef-treble',
  'live events': 'ticket',
};

type Props = {
  item: Category;
  index: number;
  onPress?: () => void;
};

export function CategoryTile({index, item, onPress}: Props) {
  const pair = PALETTE[index % PALETTE.length];
  const gradient: [string, string] = item.color
    ? [item.color, shadeColor(item.color, -40)]
    : pair;

  const iconName =
    CATEGORY_ICONS[item.name.toLowerCase()] ?? 'music-note-outline';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <LinearGradient colors={gradient} style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Text numberOfLines={2} style={styles.label}>
          {item.name}
        </Text>
        <View style={styles.iconWrap}>
          {item.imageUrl ? (
            <Image source={{uri: item.imageUrl}} style={styles.image} />
          ) : (
            <Icon name={iconName} size={52} color="rgba(255,255,255,0.35)" />
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Darken a hex color by `amount` points */
function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    maxWidth: '48.5%',
  },
  pressed: {
    transform: [{scale: 0.97}],
    opacity: 0.9,
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  label: {
    color: '#ffffff',
    fontSize: typography.body,
    fontWeight: '900',
    lineHeight: 20,
    maxWidth: '65%',
  },
  iconWrap: {
    position: 'absolute',
    bottom: -4,
    right: spacing.sm,
    transform: [{rotate: '20deg'}],
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: radius.sm,
  },
});
