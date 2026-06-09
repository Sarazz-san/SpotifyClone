import React, {useMemo, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {CategoryChip} from '../../components/CategoryChip';
import {EmptyState} from '../../components/EmptyState';
import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import type {RootStackParamList} from '../../app/navigationTypes';
import DocumentPicker, { types } from 'react-native-document-picker';
import {uploadToCloudinary, createTrack} from '../admin/adminService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const filters = ['Playlists', 'Albums', 'Artists', 'Downloaded'];

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const {playlists, tracks, refresh} = useCatalog();
  const {playTrack, playQueue, currentTrack} = usePlayer();
  
  const filteredPlaylists = playlists.filter(item => {
    if (activeFilter === 'Albums') return item.category === 'album';
    return item.category === 'playlist';
  });
  
  const artists = useMemo(() => {
    const uniqueArtistNames = Array.from(new Set(tracks.map(t => t.artist)));
    return uniqueArtistNames.map(name => {
      const track = tracks.find(t => t.artist === name);
      return {
        id: name,
        title: name,
        artist: 'Artiste',
        cover: track?.cover,
        coverUrl: (track as any)?.coverUrl,
      };
    });
  }, [tracks]);

  const handleCreatePlaylist = () => {
    setIsAddMenuVisible(false);
    Alert.alert(
      'Nouvelle Playlist',
      'Cette fonctionnalité est réservée à l’interface d’administration pour le moment.',
      [{text: 'D’accord'}]
    );
  };

  const handleImportMusic = async () => {
    try {
      // Fermer le menu pour éviter les conflits d'UI sur Android
      setIsAddMenuVisible(false);
      
      const results = await DocumentPicker.pick({
        type: [types.audio],
        copyTo: 'cachesDirectory',
      });

      const file = results[0];
      if (!file) return;

      setIsImporting(true);
      
      // Utiliser fileCopyUri pour une URI stable
      const targetUri = file.fileCopyUri || file.uri;
      const audioUrl = await uploadToCloudinary(targetUri, 'auto');
      
      await createTrack({
        title: file.name || 'Imported Track',
        artist: 'Various Artists',
        album: 'Imports',
        category: 'Imported',
        audioUrl,
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
        durationMs: 180000,
      });

      await refresh();
      Alert.alert('Succès', 'Votre musique a été importée avec succès.');
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Erreur', 'Impossible d’importer le fichier.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <Text style={styles.title}>Your Library</Text>
          <Icon color={colors.text} name="magnify" size={32} />
          <TouchableOpacity onPress={() => setIsAddMenuVisible(true)}>
            <Icon color={colors.text} name="plus" size={34} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <CategoryChip
              active={activeFilter === filter}
              key={filter}
              label={filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <View style={styles.sortLeft}>
            <Icon color={colors.text} name="sort-variant" size={22} />
            <Text style={styles.sort}>Recents</Text>
          </View>
          <Icon color={colors.text} name="view-grid-outline" size={26} />
        </View>

        <Pressable 
          style={styles.importCard}
          onPress={handleImportMusic}
          disabled={isImporting}
        >
          <Icon color={colors.text} name="tray-arrow-down" size={34} />
          <Text style={styles.importText}>
            {isImporting ? 'Importation en cours...' : 'Import your music from other apps'}
          </Text>
          <Icon color={colors.text} name="chevron-right" size={34} />
        </Pressable>

        <TouchableOpacity 
          style={styles.likedSongsCard}
          onPress={() => navigation.navigate('LikedSongs')}
        >
          <LinearGradient 
            colors={['#1DB954', '#191414']} 
            style={styles.likedSongsIcon}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Icon name="heart" size={32} color={colors.white} />
          </LinearGradient>
          <View style={styles.likedSongsInfo}>
            <Text style={styles.likedSongsTitle}>Liked Songs</Text>
            <Text style={styles.likedSongsSubtitle}>Playlist • 3 songs</Text>
          </View>
        </TouchableOpacity>

        {activeFilter === 'Artists' ? (
          artists.map(artist => {
            const artistTracks = tracks.filter(t => t.artist === artist.id);
            return (
              <TrackRow
                item={artist as any}
                key={artist.id}
                meta="Artist"
                onPress={() => playQueue(artistTracks)}
                roundCover
                trailingIcon={artistTracks.some(t => t.id === currentTrack?.id) ? 'equalizer' : 'chevron-right'}
              />
            );
          })
        ) : filteredPlaylists.length ? (
          filteredPlaylists.map(item => (
            <TrackRow
              item={item}
              key={item.id}
              onPress={() => navigation.navigate('PlaylistDetail', {playlistId: item.id})}
              trailingIcon={item.pinned ? 'pin' : 'chevron-right'}
            />
          ))
        ) : (
          <EmptyState
            title={`Aucun résultat pour ${activeFilter.toLowerCase()}`}
            message="Commencez à ajouter des titres à votre bibliothèque pour les retrouver ici."
          />
        )}

        <LibraryAction icon="plus" label="Add podcasts" />
        <LibraryAction icon="plus" label="Add events and venues" />
        <LibraryAction 
          icon="plus" 
          label="Add artists" 
          onPress={() => navigation.navigate('ArtistPicker')} 
          round 
        />
        <LibraryAction 
          icon="tray-arrow-down" 
          label={isImporting ? 'Importing...' : 'Import your music'} 
          onPress={handleImportMusic}
        />
      </ScrollView>

      {/* Add Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddMenuVisible}
        onRequestClose={() => setIsAddMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsAddMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <MenuOption 
              icon="music-note-plus" 
              title="Playlist" 
              description="Create a playlist with songs or episodes" 
              onPress={handleCreatePlaylist}
            />
            <MenuOption 
              icon="account-group" 
              title="Collaborative playlist" 
              description="Create a playlist together with friends" 
              onPress={() => setIsAddMenuVisible(false)}
            />
            <MenuOption 
              icon="record-circle-outline" 
              title="Blend" 
              description="Combine your friends' tastes into a playlist" 
              onPress={() => setIsAddMenuVisible(false)}
            />
            <MenuOption 
              icon="folder-outline" 
              title="Folder" 
              description="Organize your playlists" 
              onPress={() => setIsAddMenuVisible(false)}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function LibraryAction({
  icon,
  label,
  onPress,
  round = false,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  round?: boolean;
}) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={[styles.actionIcon, round ? styles.actionIconRound : null]}>
        <Icon color={colors.textMuted} name={icon} size={34} />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function MenuOption({icon, title, description, onPress}: {icon: string; title: string; description: string, onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={28} color={colors.textMuted} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuOptionTitle}>{title}</Text>
        <Text style={styles.menuOptionDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 170,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#bf7a4c',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '900',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '900',
  },
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  sortRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sort: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '900',
  },
  importCard: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
  },
  importText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    lineHeight: 22,
  },
  actionRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  actionIconRound: {
    borderRadius: radius.full,
  },
  actionText: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  likedSongsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  likedSongsIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedSongsInfo: {
    marginLeft: spacing.lg,
  },
  likedSongsTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  likedSongsSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuOptionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  menuOptionDesc: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
