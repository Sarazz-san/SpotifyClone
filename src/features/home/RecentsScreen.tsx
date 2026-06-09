import React from 'react';
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

import {colors} from '../../constants/colors';
import {spacing, radius} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {useCatalog} from '../catalog/CatalogContext';
import {CategoryChip} from '../../components/CategoryChip';
import {usePlayer} from '../player/PlayerContext';

import {useAuth} from '../auth/AuthContext';
import {subscribeToRecentlyPlayed} from '../user/userService';
import type {Track} from '../../models/Track';

export function RecentsScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const {playQueue} = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = React.useState<Track[]>([]);

  React.useEffect(() => {
    if (user) return subscribeToRecentlyPlayed(user, setRecentlyPlayed);
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recents</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterRow}>
          <CategoryChip label="Music" active={true} onPress={() => {}} />
        </View>

        <Text style={styles.sectionTitle}>Today</Text>

        {recentlyPlayed.map((item, index) => (
          <TouchableOpacity 
            key={`${item.id}-${index}`} 
            style={styles.itemRow}
            onPress={() => playQueue(recentlyPlayed, index)}
          >
            <Image source={typeof item.cover === 'number' ? item.cover : {uri: (item as any).coverUrl || (item as any).cover?.uri}} style={styles.cover} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>Song • {item.artist}</Text>
            </View>
            <Icon name="dots-vertical" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDeep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.white, fontSize: typography.body, fontWeight: '900' },
  content: { padding: spacing.lg },
  filterRow: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.white, fontSize: typography.title, fontWeight: '900', marginBottom: spacing.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  cover: { width: 56, height: 56, borderRadius: radius.sm },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.white, fontSize: typography.body, fontWeight: '800' },
  itemSubtitle: { color: colors.textMuted, fontSize: typography.small, marginTop: 2 },
});
