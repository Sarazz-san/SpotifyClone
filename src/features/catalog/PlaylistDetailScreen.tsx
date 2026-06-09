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
import {typography} from '../../constants/typography';
import {useCatalog} from './CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import type {RootStackParamList} from '../../app/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export function PlaylistDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PlaylistDetailRouteProp>();
  const {playlistId} = route.params;
  const {playlists, tracks} = useCatalog();
  const {playTrack, playQueue, currentTrack} = usePlayer();

  const playlist = playlists.find(p => p.id === playlistId);
  const playlistTracks = tracks.filter(t => playlist?.trackIds.includes(t.id));

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={{color: colors.text}}>Playlist non trouvée</Text>
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
          colors={[colors.surfaceHigh, colors.background]}
          style={styles.header}
        >
          <Image 
            source={typeof playlist.cover === 'number' ? playlist.cover : {uri: (playlist as any).coverUrl || (playlist as any).cover?.uri}} 
            style={styles.cover} 
          />
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.subtitle}>{playlist.subtitle}</Text>
          
          <View style={styles.controls}>
            <View style={styles.infoRow}>
              <Icon name="heart-outline" size={24} color={colors.textMuted} />
              <Text style={styles.infoText}>{playlistTracks.length} titres</Text>
            </View>
            <TouchableOpacity style={styles.playButton} onPress={() => playlistTracks.length > 0 && playQueue(playlistTracks)}>
              <Icon name="play" size={32} color={colors.black} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.trackList}>
          {playlistTracks.map(track => (
            <TrackRow
              key={track.id}
              item={track}
              onPress={() => playQueue(playlistTracks, playlistTracks.indexOf(track))}
              trailingIcon={track.id === currentTrack?.id ? 'equalizer' : 'dots-vertical'}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
