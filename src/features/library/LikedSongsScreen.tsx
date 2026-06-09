import React, {useMemo} from 'react';
import {
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

import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import type {RootStackParamList} from '../../app/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LikedSongsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {tracks} = useCatalog();
  const {playQueue, currentTrack, likedTrackIds} = usePlayer();

  // Filtrer les titres du catalogue qui sont dans la liste des favoris
  const likedSongs = useMemo(() => {
    return tracks.filter(track => likedTrackIds.includes(track.id));
  }, [tracks, likedTrackIds]);

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
          colors={[colors.primary, colors.background]}
          style={styles.header}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
        >
          <LinearGradient
            colors={[colors.primary, colors.backgroundDeep]}
            style={styles.coverPlaceholder}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Icon name="heart" size={100} color={colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Liked Songs</Text>
          <Text style={styles.subtitle}>{likedSongs.length} songs</Text>
          
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => likedSongs.length > 0 && playQueue(likedSongs)}
          >
            <Icon name="play" size={32} color={colors.black} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.trackList}>
          {likedSongs.length > 0 ? (
            likedSongs.map((track, index) => (
              <TrackRow
                key={track.id}
                item={track}
                onPress={() => playQueue(likedSongs, index)}
                trailingIcon={track.id === currentTrack?.id ? 'equalizer' : 'heart'}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Your liked songs will appear here.</Text>
          )}
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
  coverPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    color: colors.white,
    fontSize: 28,
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
  playButton: {
    position: 'absolute',
    bottom: -28,
    right: spacing.lg,
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
    marginTop: 40,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    fontWeight: '700',
  },
});
