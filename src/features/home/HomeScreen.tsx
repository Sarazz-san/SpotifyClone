import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AlbumCard} from '../../components/AlbumCard';
import {CategoryChip} from '../../components/CategoryChip';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import type {Playlist} from '../../models/Playlist';
import type {Track} from '../../models/Track';
import {useAuth} from '../auth/AuthContext';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import {subscribeToRecentlyPlayed, subscribeToFollowedArtists} from '../user/userService';
import type {RootStackParamList} from '../../app/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CHIP_FILTERS = ['All', 'Music', 'Podcasts', 'Albums'];
function CardGap() {
  return <View style={styles.cardGap} />;
}

function isTrack(item: Playlist | Track): item is Track {
  // A track always has an `artist` property; playlists do not
  return (item as Track).artist !== undefined;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function resolveImageSource(item: Playlist | Track) {
  if (!item.cover) return require('../../assets/images/logo_spotify_green.png');
  if (typeof item.cover === 'number') return item.cover;
  if (typeof item.cover === 'string') return {uri: item.cover};
  return item.cover;
}
  

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {user, logout} = useAuth();
  const {isLoading: isCatalogLoading, playlists, tracks: allTracks} = useCatalog();
  const {currentTrack, playTrack} = usePlayer();
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentlyPlayedRaw, setRecentlyPlayedRaw] = useState<Track[]>([]);
  const [followedArtists, setFollowedArtists] = useState<{id: string; name: string; image: string}[]>([]);

  useEffect(() => {
    if (user) {
      const unsubRecent = subscribeToRecentlyPlayed(user, setRecentlyPlayedRaw);
      const unsubFollowed = subscribeToFollowedArtists(user, setFollowedArtists);
      return () => {
        unsubRecent();
        unsubFollowed();
      };
    }
  }, [user]);

  // Map raw recently played tracks to fully populated catalog tracks (with correct covers)
  const recentlyPlayed = useMemo(() => {
    return recentlyPlayedRaw.map(recent => {
      const fullTrack = allTracks.find(t => t.id === recent.id);
      return fullTrack || recent;
    });
  }, [recentlyPlayedRaw, allTracks]);

  // ── Derived data ────────────────────────────────────────────────────────
  // Filter quick-access grid by chip
  const quickItems: Array<Playlist | Track> = useMemo(() => {
    const combined: Array<Playlist | Track> = [...playlists, ...allTracks];
    if (activeFilter === 'Music') {
      return combined.filter(item => {
        if (isTrack(item)) return item.type === 'music';
        return (item as Playlist).category === 'playlist' || (item as Playlist).category === 'album';
      }).slice(0, 8);
    }
    if (activeFilter === 'Podcasts') {
      return combined.filter(item => {
        if (isTrack(item)) return item.type === 'podcast';
        return (item as Playlist).category === 'podcast';
      }).slice(0, 8);
    }
    if (activeFilter === 'Albums') {
      return playlists.filter(item => (item as Playlist).category === 'album').slice(0, 8);
    }
    return combined.slice(0, 8);
  }, [playlists, allTracks, activeFilter]);

  const jumpBackItems = useMemo(() => playlists.slice(0, 6), [playlists]);

  // Deduplicated station items (fix: no more [...tracks, ...tracks])
  const stationItems = useMemo(() => allTracks.slice(0, 6), [allTracks]);

  const artistMixes = useMemo(() => {
    return followedArtists.map(artist => {
      const artistTracks = allTracks.filter(t => t.artist === artist.name);
      return {
        artist,
        tracks: artistTracks.length > 0 ? artistTracks : allTracks.slice(0, 5),
      };
    });
  }, [followedArtists, allTracks]);

  const handleQuickPress = (item: Playlist | Track) => {
    if (isTrack(item)) {
      playTrack(item);
      return;
    }
    navigation.navigate('PlaylistDetail', {playlistId: item.id});
  };

  const handleAvatarPress = () => {
    Alert.alert(
      user?.displayName || 'Utilisateur',
      `Connecté en tant que ${user?.email}\n${user?.isAdmin ? 'Rôle: Administrateur' : 'Rôle: Auditeur'}`,
      [
        {text: 'Déconnexion', onPress: logout, style: 'destructive'},
        {text: 'Fermer', style: 'cancel'},
      ],
    );
  };

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  // Greeting uses a premium font (headline) and stays on a single line
  const greeting = `${getGreeting()}, ${user?.displayName?.split(' ')[0] || 'User'}`;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Pressable onPress={handleAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {CHIP_FILTERS.map(f => (
            <CategoryChip
              active={f === activeFilter}
              key={f}
              label={f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Greeting ── */}
      <View style={styles.greetingRow}>
        <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
          {greeting}
        </Text>
      </View>

      {/* ── Quick Access Grid ── */}
      {quickItems.length > 0 ? (
        <View style={styles.quickGrid}>
          {quickItems.map(item => (
            <Pressable
              key={item.id}
              onPress={() => handleQuickPress(item)}
              style={({pressed}) => [styles.quickCard, pressed && styles.quickPressed]}>
              <Image
                source={resolveImageSource(item)}
                style={styles.quickImage}
              />
              <Text numberOfLines={2} style={styles.quickTitle}>
                {item.title}
              </Text>
              {isTrack(item) && item.id === currentTrack?.id ? (
                <Icon color={colors.primary} name="equalizer" size={16} style={styles.playingIcon} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* ── Jump Back In ── */}
      {jumpBackItems.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Jump back in</Text>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={jumpBackItems}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <AlbumCard item={item} onPress={() => handleQuickPress(item)} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}

      {/* ── Recently Played ── */}
      {recentlyPlayed.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleInline}>Recently played</Text>
            <Pressable onPress={() => navigation.navigate('Recents')}>
              <Text style={styles.showAll}>Show all</Text>
            </Pressable>
          </View>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={recentlyPlayed}
            horizontal
            keyExtractor={item => `recent-${item.id}`}
            renderItem={({item}) => (
              <AlbumCard
                item={item}
                onPress={() => playTrack(item)}
                subtitle="Song • Spotify"
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}

      {/* ── Recommended Stations ── */}
      {stationItems.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Recommended Stations</Text>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={stationItems}
            horizontal
            keyExtractor={item => `station-${item.id}`}
            renderItem={({item}) => (
              <AlbumCard
                item={item}
                onPress={() => playTrack(item)}
                subtitle={item.artist}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}

      {/* ── Artist Mixes ── */}
      {artistMixes.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Vos Mix</Text>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={artistMixes}
            horizontal
            keyExtractor={mix => `mix-card-${mix.artist.id}`}
            renderItem={({item: mix}) => (
              <AlbumCard
                item={{
                  id: mix.artist.id,
                  title: `Mix ${mix.artist.name}`,
                  category: 'playlist',
                  cover: mix.artist.image ? {uri: mix.artist.image} : require('../../assets/images/logo_spotify_green.png'),
                  trackIds: [], 
                  createdAt: new Date(), 
                } as any}
                onPress={() => navigation.navigate('ArtistDetail', {artistName: mix.artist.name, artistImage: mix.artist.image})}
                subtitle="Créé pour vous"
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}

      {/* ── Empty State ── */}
      {!allTracks.length && !isCatalogLoading ? (
        <View style={styles.emptyWrap}>
          <Icon name="music-note-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Discover new tracks</Text>
          <Text style={styles.emptySub}>
            Your library is empty. Explore suggested titles to get started.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 52,
    paddingBottom: 170,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#bf7a4c',
  },
  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  chips: {
    flex: 1,
    gap: spacing.sm,
    alignItems: 'center',
  },
  notifBtn: {
    padding: spacing.xs,
  },
  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quickCard: {
    width: '48.5%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  quickPressed: {
    opacity: 0.75,
  },
  quickImage: {
    width: 60,
    height: 60,
  },
  quickTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    lineHeight: 16,
  },
  playingIcon: {
    marginRight: spacing.sm,
  },
  // Sections
  sectionTitle: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitleInline: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
  },
  showAll: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  cardGap: {
    width: spacing.lg,
  },
  // Empty state
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  greeting: {
    flex: 1,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '900',
  },
});
