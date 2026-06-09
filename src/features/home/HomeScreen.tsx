import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AlbumCard} from '../../components/AlbumCard';
import {CategoryChip} from '../../components/CategoryChip';
import {EmptyState} from '../../components/EmptyState';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import type {Playlist} from '../../models/Playlist';
import type {Track} from '../../models/Track';
import {useAuth} from '../auth/AuthContext';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import {subscribeToRecentlyPlayed} from '../user/userService';
import type {RootStackParamList} from '../../app/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function CardGap() {
  return <View style={styles.cardGap} />;
}

function isTrack(item: Playlist | Track): item is Track {
  return 'artist' in item;
}

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {user, logout} = useAuth();
  const {
    categories,
    isLoading: isCatalogLoading,
    playlists,
    tracks: allTracks,
  } = useCatalog();
  const {currentTrack, playTrack, playQueue} = usePlayer();
  const [activeCategory, setActiveCategory] = useState('All');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const quickItems: Array<Playlist | Track> = [...playlists, ...allTracks].slice(0, 8);
  const jumpBackItems = playlists.slice(0, 4);
  const stationItems = allTracks.slice(0, 10);

  useEffect(() => {
    if (user) return subscribeToRecentlyPlayed(user, setRecentlyPlayed);
  }, [user]);

  const handleQuickPress = (item: Playlist | Track) => {
    if (isTrack(item)) {
      playTrack(item, allTracks);
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
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={handleAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || 'S'}
          </Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {['All', 'Music', 'Podcasts'].map(category => (
            <CategoryChip
              active={category === activeCategory}
              key={category}
              label={category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {!allTracks.length && !isCatalogLoading ? (
        <EmptyState
          title="Découvrez de nouveaux titres"
          message="Votre bibliothèque est vide pour le moment. Explorez les titres suggérés."
        />
      ) : null}

      {quickItems.length ? (
        <View style={styles.quickGrid}>
          {quickItems.map(item => (
            <Pressable
              key={item.id}
              onPress={() => handleQuickPress(item)}
              style={styles.quickCard}>
              <Image 
                source={typeof item.cover === 'number' ? item.cover : {uri: (item as any).coverUrl || (item as any).cover?.uri}} 
                style={styles.quickImage} 
              />
              <Text numberOfLines={2} style={styles.quickTitle}>
                {item.title}
              </Text>
              {isTrack(item) && item.id === currentTrack?.id ? (
                <Icon color={colors.primary} name="equalizer" size={20} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {jumpBackItems.length ? (
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

      {stationItems.length ? (
        <>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={stationItems}
            horizontal
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({item}) => (
              <AlbumCard
                item={item}
                onPress={() => playQueue(stationItems, stationItems.indexOf(item))}
                subtitle={`${item.artist}`}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}

      {recentlyPlayed.length ? (
        <>
          <View style={styles.recentsHeader}>
            <Text style={styles.sectionTitleInline}>Recently played</Text>
            <Pressable onPress={() => navigation.navigate('Recents')}>
              <Text style={styles.showAll}>Show all</Text>
            </Pressable>
          </View>
          <FlatList
            ItemSeparatorComponent={CardGap}
            data={recentlyPlayed}
            horizontal
            keyExtractor={item => `${item.id}-${item.title}`}
            renderItem={({item}) => (
              <AlbumCard
                item={item}
                onPress={() => playQueue(recentlyPlayed, recentlyPlayed.indexOf(item))}
                subtitle="Song"
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 170,
  },
  topBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#bf7a4c',
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  chips: {
    gap: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickCard: {
    width: '48.5%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  quickImage: {
    width: 56,
    height: 56,
  },
  quickTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitleInline: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  recentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  showAll: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  cardGap: {
    width: spacing.md,
  },
});
