import React from 'react';
import {StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

import {colors} from '../../constants/colors';
import {spacing, radius} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {CategoryChip} from '../../components/CategoryChip';

import {useAuth} from '../auth/AuthContext';
import {subscribeToRecentlyPlayed} from '../user/userService';
import {useCatalog} from '../catalog/CatalogContext';
import type {Track} from '../../models/Track';
import {usePlayer} from '../player/PlayerContext';
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';

export function RecentsScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const {playTrack} = usePlayer();
  const {tracks: allTracks} = useCatalog();
  const [recentlyPlayedRaw, setRecentlyPlayedRaw] = React.useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null);

  React.useEffect(() => {
    if (user) return subscribeToRecentlyPlayed(user, setRecentlyPlayedRaw);
  }, [user]);

  const recentlyPlayed = React.useMemo(() => {
    return recentlyPlayedRaw.map(recent => {
      const fullTrack = allTracks.find(t => t.id === recent.id);
      return fullTrack || recent;
    });
  }, [recentlyPlayedRaw, allTracks]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recents</Text>
        <View style={styles.headerSpacer} />
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
            onPress={() => playTrack(item)}
          >
            <Image source={item.cover} style={styles.cover} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>Song • {item.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedTrack(item)}>
              <Icon name="dots-vertical" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AddToPlaylistModal 
        visible={!!selectedTrack}
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
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
  headerSpacer: { width: 28 },
  content: { padding: spacing.lg },
  filterRow: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.white, fontSize: typography.title, fontWeight: '900', marginBottom: spacing.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  cover: { width: 56, height: 56, borderRadius: radius.sm },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.white, fontSize: typography.body, fontWeight: '800' },
  itemSubtitle: { color: colors.textMuted, fontSize: typography.small, marginTop: 2 },
});
