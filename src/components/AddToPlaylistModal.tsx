import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '../features/admin/adminService';
import { useCatalog } from '../features/catalog/CatalogContext';
import { Track } from '../models/Track';

type Props = {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
};

export function AddToPlaylistModal({ visible, track, onClose }: Props) {
  const { playlists, refresh } = useCatalog();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const userPlaylists = playlists.filter(p => p.category === 'playlist');

  const togglePlaylist = async (playlistId: string, trackExists: boolean) => {
    if (!track) return;
    
    setIsUpdating(playlistId);
    try {
      if (trackExists) {
        await removeTrackFromPlaylist(playlistId, track.id);
      } else {
        await addTrackToPlaylist(playlistId, track.id);
      }
      await refresh();
    } catch (error) {
      console.error('Error toggling track in playlist:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  if (!track) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add to Playlist</Text>
          <Text style={styles.subtitle}>{track.title}</Text>

          <FlatList
            data={userPlaylists}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const trackExists = item.trackIds.includes(track.id);
              
              return (
                <TouchableOpacity 
                  style={styles.playlistRow}
                  onPress={() => togglePlaylist(item.id, trackExists)}
                  disabled={isUpdating === item.id}
                >
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{item.title}</Text>
                    <Text style={styles.trackCount}>{item.trackIds.length} tracks</Text>
                  </View>
                  
                  {isUpdating === item.id ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Icon 
                      name={trackExists ? 'check-circle' : 'circle-outline'} 
                      size={28} 
                      color={trackExists ? colors.primary : colors.textMuted} 
                    />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You don't have any playlists yet.</Text>
            }
          />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    height: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  trackCount: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  closeButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
  },
});
