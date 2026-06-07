import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {useCatalog} from './CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import type {RootStackParamList} from '../../app/navigationTypes';
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';
import {Track} from '../../models/Track';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export function PlaylistDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PlaylistDetailRouteProp>();
  const {playlistId} = route.params;
  const {playlists, tracks} = useCatalog();
  const {playTrack, currentTrack} = usePlayer();
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null);

  const playlist = playlists.find(p => p.id === playlistId);
  const playlistTracks = tracks.filter(t => playlist?.trackIds.includes(t.id));

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Playlist non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={28} color={colors.white} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#535353', colors.backgroundDeep]}
          style={styles.header}
        >
          <Image 
            source={playlist.cover} 
            style={styles.cover} 
          />
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.subtitle}>{playlist.subtitle}</Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{playlist.category.toUpperCase()}</Text>
          </View>
          
          <View style={styles.controls}>
            <View style={styles.infoRow}>
              <Icon name="heart-outline" size={24} color={colors.textMuted} />
              <Text style={styles.infoText}>{playlistTracks.length} titres</Text>
            </View>
            <TouchableOpacity style={styles.playButton} onPress={() => playlistTracks[0] && playTrack(playlistTracks[0])}>
              <Icon name="play" size={32} color={colors.black} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.trackList}>
          {playlistTracks.map(track => (
            <TrackRow
              key={track.id}
              item={track}
              onPress={() => playTrack(track)}
              onIconPress={() => setSelectedTrack(track)}
              trailingIcon={track.id === currentTrack?.id ? 'equalizer' : 'dots-vertical'}
            />
          ))}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
  },
  notFoundText: {
    color: colors.text,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    zIndex: 10,
    padding: spacing.xs,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  cover: {
    width: 240,
    height: 240,
    borderRadius: radius.sm,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: spacing.md,
  },
  categoryText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  trackList: {
    paddingHorizontal: spacing.md,
  },
});
