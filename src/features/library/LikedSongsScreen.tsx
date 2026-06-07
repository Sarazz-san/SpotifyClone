import React from 'react';
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
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';
import {Track} from '../../models/Track';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LikedSongsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {tracks} = useCatalog();
  const {playTrack, currentTrack, likedTrackIds} = usePlayer();
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null);

  // Filter tracks that are liked by the user
  const likedSongs = tracks.filter(t => likedTrackIds.includes(t.id));

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
          colors={['#450af5', colors.backgroundDeep]}
          style={styles.header}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
        >
          <LinearGradient
            colors={['#450af5', '#c4efd9']}
            style={styles.coverPlaceholder}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Icon name="heart" size={100} color={colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Titres likés</Text>
          <Text style={styles.subtitle}>{likedSongs.length} titres</Text>
          
          <TouchableOpacity style={styles.playButton} onPress={() => likedSongs[0] && playTrack(likedSongs[0])}>
            <Icon name="play" size={32} color={colors.black} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.trackList}>
          {likedSongs.length > 0 ? (
            likedSongs.map(track => (
              <TrackRow
                key={track.id}
                item={track}
                onPress={() => playTrack(track)}
                onIconPress={() => setSelectedTrack(track)}
                trailingIcon={track.id === currentTrack?.id ? 'equalizer' : 'dots-vertical'}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Vos titres likés apparaîtront ici.</Text>
          )}
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
    backgroundColor: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
    elevation: 20,
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
