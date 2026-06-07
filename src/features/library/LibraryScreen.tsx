import React, {useMemo, useState, useEffect} from 'react';
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
import {useAuth} from '../auth/AuthContext';
import {subscribeToFollowedArtists} from '../user/userService';
import type {RootStackParamList} from '../../app/navigationTypes';
import DocumentPicker from 'react-native-document-picker';
import {uploadToCloudinary, createTrack} from '../admin/adminService';
import {CreatePlaylistModal} from '../../components/CreatePlaylistModal';
import {extractMetadata} from '../../utils/metadataParser';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const filters = ['Playlists', 'Albums', 'Artists', 'Downloaded'];

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const {playlists, tracks, refresh} = useCatalog();
  const {playTrack, likedTrackIds} = usePlayer();
  const {user} = useAuth();
  const [followedArtists, setFollowedArtists] = useState<{id: string; name: string; image: string}[]>([]);
  
  useEffect(() => {
    if (user) {
      return subscribeToFollowedArtists(user, setFollowedArtists);
    }
  }, [user]);

  const filteredPlaylists = playlists.filter(item => {
    if (activeFilter === 'Albums') return item.category === 'album';
    return item.category === 'playlist';
  });
  
  const displayArtists = useMemo(() => {
    return followedArtists.map(fa => ({
      id: fa.id,
      title: fa.name,
      artist: fa.name,
      album: 'Artist',
      durationMs: 0,
      cover: fa.image ? {uri: fa.image} : require('../../assets/images/logo_spotify_green.png'),
      audioUrl: '',
    }));
  }, [followedArtists]);

  const handleCreatePlaylist = () => {
    setIsAddMenuVisible(false);
    setIsCreateModalVisible(true);
  };

  const handleImportMusic = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      const file = result[0];
      setIsImporting(true);
      
      const audioUrl = await uploadToCloudinary(file.uri, 'auto');
      
      let title = file.name || 'Imported Track';
      let artist = 'Various Artists';
      let album = 'Imports';
      let genre = undefined;
      let coverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';
      
      try {
        const metadata = await extractMetadata(file.uri);
        if (metadata.title) title = metadata.title;
        if (metadata.artist) artist = metadata.artist;
        if (metadata.album) album = metadata.album;
        if (metadata.genre) genre = metadata.genre;
        if (metadata.coverUri) {
          // The base64 can be uploaded or just passed as is. If uploading is needed, this works as data URI for cloudinary.
          coverUrl = await uploadToCloudinary(metadata.coverUri, 'image');
        }
      } catch (err) {
        console.log('No metadata found or error extracting', err);
      }

      await createTrack({
        title,
        artist,
        album,
        type: 'music',
        genre,
        audioUrl,
        coverUrl,
        durationMs: 180000,
        userId: user?.id, // Added userId for privacy
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
          <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
            <Icon name="tag-multiple" size={20} color={colors.text} />
            <Text style={styles.menuButtonText}>Catégories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
            <Icon name="music-note" size={20} color={colors.text} />
            <Text style={styles.menuButtonText}>Genres</Text>
          </TouchableOpacity>
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
            colors={['#450af5', '#c4efd9']} 
            style={styles.likedSongsIcon}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Icon name="heart" size={32} color={colors.white} />
          </LinearGradient>
          <View style={styles.likedSongsInfo}>
            <Text style={styles.likedSongsTitle}>Liked Songs</Text>
            <Text style={styles.likedSongsSubtitle}>Playlist • {likedTrackIds.length} song{likedTrackIds.length !== 1 ? 's' : ''}</Text>
          </View>
        </TouchableOpacity>

        {activeFilter === 'Artists' ? (
          displayArtists.length ? (
            displayArtists.map(track => (
              <TrackRow
                item={track}
                key={track.id}
                meta="Artist"
                onPress={() => navigation.navigate('ArtistDetail', {artistName: track.artist, artistImage: (track.cover as any)?.uri || ''})}
                roundCover
                trailingIcon="chevron-right"
              />
            ))
          ) : (
            <EmptyState
              title="Aucun artiste suivi"
              message="Appuyez sur Add artists pour suivre vos artistes préférés."
            />
          )
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
        <View style={styles.statCard}>
          <Icon name="shape" size={30} color={colors.textMuted} />
          <Text style={styles.statText}>Genres</Text>
        </View>
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
              onPress={() => {
                setIsAddMenuVisible(false);
                Alert.alert('À venir', 'Les playlists collaboratives seront bientôt disponibles !');
              }}
            />
            <MenuOption 
              icon="record-circle-outline" 
              title="Blend" 
              description="Combine your friends' tastes into a playlist" 
              onPress={() => {
                setIsAddMenuVisible(false);
                Alert.alert('À venir', 'La fonctionnalité Blend sera bientôt disponible !');
              }}
            />
            <MenuOption 
              icon="folder-outline" 
              title="Folder" 
              description="Organize your playlists" 
              onPress={() => {
                setIsAddMenuVisible(false);
                Alert.alert('À venir', 'Les dossiers seront bientôt disponibles !');
              }}
            />
          </View>
        </Pressable>
      </Modal>

      <CreatePlaylistModal 
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
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
