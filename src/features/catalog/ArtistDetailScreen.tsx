import React, {useMemo} from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArtistDetailRouteProp = RouteProp<RootStackParamList, 'ArtistDetail'>;

export function ArtistDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ArtistDetailRouteProp>();
  const {artistName, artistImage} = route.params;
  const {tracks} = useCatalog();
  const {playTrack, currentTrack} = usePlayer();

  const artistTracks = useMemo(() => {
    return tracks.filter(t => t.artist === artistName);
  }, [tracks, artistName]);

  const tracksByAlbum = useMemo(() => {
    const grouped: Record<string, typeof artistTracks> = {};
    artistTracks.forEach(track => {
      const album = track.album || 'Singles';
      if (!grouped[album]) grouped[album] = [];
      grouped[album].push(track);
    });
    return grouped;
  }, [artistTracks]);

  if (!artistTracks.length) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.notFoundText}>Aucun morceau trouvé pour {artistName}</Text>
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
        <View style={styles.header}>
          <Image 
            source={artistImage ? {uri: artistImage} : require('../../assets/images/logo_spotify_green.png')} 
            style={styles.cover} 
          />
          <LinearGradient
            colors={['transparent', colors.backgroundDeep]}
            style={styles.gradientOverlay}
          />
          <Text style={styles.title}>{artistName}</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{artistTracks.length} titres au total</Text>
          </View>
          <TouchableOpacity style={styles.playButton} onPress={() => artistTracks[0] && playTrack(artistTracks[0])}>
            <Icon name="play" size={32} color={colors.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.trackList}>
          {Object.entries(tracksByAlbum).map(([album, groupTracks]) => (
            <View key={album} style={styles.albumSection}>
              <Text style={styles.albumTitle}>{album}</Text>
              {groupTracks.map(track => (
                <TrackRow
                  key={track.id}
                  item={track}
                  onPress={() => playTrack(track)}
                  trailingIcon={track.id === currentTrack?.id ? 'equalizer' : 'dots-vertical'}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    padding: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
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
  },
  trackList: {
    padding: spacing.lg,
  },
  albumSection: {
    marginBottom: spacing.xl,
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.md,
  },
  notFoundText: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
