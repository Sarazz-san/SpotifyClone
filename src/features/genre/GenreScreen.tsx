import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {RootStackParamList} from '../../app/navigationTypes';
import type {RouteProp} from '@react-navigation/native';
import {useCatalog} from '../catalog/CatalogContext';
import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import type {Track} from '../../models/Track';
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';
import {usePlayer} from '../player/PlayerContext';

type Props = {
  route: RouteProp<RootStackParamList, 'Genre'>;
};

function TrackSeparator() {
  return <View style={styles.separator} />;
}

export function GenreScreen({route}: Props) {
  const {genreName} = route.params;
  const {tracks} = useCatalog();
  const {playTrack, currentTrack} = usePlayer();
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null);

  const filtered: Track[] = tracks.filter(t => {
    const g = t.genre ? String(t.genre).toLowerCase() : '';
    return g === genreName.toLowerCase();
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{genreName}</Text>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TrackRow 
            item={item} 
            onPress={() => playTrack(item)} 
            onIconPress={() => setSelectedTrack(item)}
            trailingIcon={item.id === currentTrack?.id ? 'equalizer' : 'dots-vertical'}
          />
        )}
        ItemSeparatorComponent={TrackSeparator}
        contentContainerStyle={styles.listContent}
      />

      <AddToPlaylistModal 
        visible={!!selectedTrack}
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.backgroundDeep},
  title: {color: colors.text, fontSize: 22, fontWeight: '900', padding: spacing.lg},
  listContent: {padding: spacing.lg},
  separator: {height: spacing.md},
});
