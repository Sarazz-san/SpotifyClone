import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import type {RootStackParamList} from '../../app/navigationTypes';
import type {RouteProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useCatalog} from '../catalog/CatalogContext';
import {AlbumCard} from '../../components/AlbumCard';
import {colors} from '../../constants/colors';
import {spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';

type Props = {
  route: RouteProp<RootStackParamList, 'Category'>;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CategoryScreen({route}: Props) {
  const {categoryName} = route.params;
  const {playlists} = useCatalog();
  const navigation = useNavigation<NavigationProp>();
// Filter playlists by category name
let categoryPlaylists = playlists;
const nameLower = categoryName.toLowerCase();

if (nameLower === 'podcasts' || nameLower === 'podcast') {
  categoryPlaylists = playlists.filter(p => p.category === 'podcast');
} else if (nameLower === 'albums' || nameLower === 'album') {
  categoryPlaylists = playlists.filter(p => p.category === 'album');
} else if (nameLower === 'music') {
  categoryPlaylists = playlists.filter(p => p.category === 'playlist' || p.category === 'album');
} else {
  categoryPlaylists = playlists.filter(p => 
    p.category && p.category.toLowerCase() === nameLower
  );
  // Fallback if no exact match
  if (categoryPlaylists.length === 0) {
    categoryPlaylists = playlists; // Show all for demo purposes if category is generic like 'Made For You'
  }
}
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon 
          name="arrow-left" 
          size={28} 
          color={colors.white} 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        />
        <Text style={styles.title}>{categoryName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        {categoryPlaylists.length > 0 ? (
          <View style={styles.grid}>
            {categoryPlaylists.map(playlist => (
              <AlbumCard 
                key={playlist.id}
                item={playlist} 
                onPress={() => navigation.navigate('PlaylistDetail', {playlistId: playlist.id})} 
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucune playlist trouvée pour cette catégorie.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.backgroundDeep},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  content: {padding: spacing.lg, paddingBottom: 100},
  title: {color: colors.white, fontSize: typography.display, fontWeight: '900'},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.xl,
  }
});
