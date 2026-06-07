import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {CategoryTile} from '../../components/CategoryTile';
import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';
import {useAuth} from '../auth/AuthContext';
import {deleteSearchQuery, saveSearchQuery, subscribeToSearchHistory} from '../user/userService';
import type {RootStackParamList} from '../../app/navigationTypes';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AddToPlaylistModal} from '../../components/AddToPlaylistModal';
import {Track} from '../../models/Track';
import type {Category} from '../catalog/catalogService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {user} = useAuth();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const {categories, tracks, genres} = useCatalog();
  const {playTrack} = usePlayer();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (user) return subscribeToSearchHistory(user.id, setHistory);
  }, [user]);

  // Build the Browse All grid: merge Firebase categories + Genres from tracks + Podcasts/Albums
  const browseItems = useMemo((): Category[] => {
    const firebaseItems: Category[] = categories.length > 0 ? categories : [];
    
    // Add Podcasts and Albums to browse items if not present
    const specialItems: Category[] = [
      { id: 'cat-podcasts', name: 'Podcasts' },
      { id: 'cat-albums', name: 'Albums' }
    ];

    const genreItems: Category[] = genres.map((g, i) => ({
      id: `genre-${i}`,
      name: g,
    }));

    const nameSet = new Set<string>();
    const result: Category[] = [];

    const addIfNew = (item: Category) => {
      const key = item.name.toLowerCase();
      if (!nameSet.has(key)) {
        nameSet.add(key);
        result.push(item);
      }
    };

    specialItems.forEach(item => addIfNew(item));
    firebaseItems.forEach(item => addIfNew(item));
    genreItems.forEach(item => addIfNew(item));

    return result;
  }, [categories, genres]);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return tracks.filter(track => {
      const genre = track.genre ? String(track.genre).toLowerCase() : '';
      return (
        track.title.toLowerCase().includes(value) ||
        track.artist.toLowerCase().includes(value) ||
        track.album.toLowerCase().includes(value) ||
        genre.includes(value)
      );
    });
  }, [query, tracks]);

  const handleSearchSubmit = () => {
    if (query.trim() && user) {
      saveSearchQuery(user.id, query.trim());
    }
  };

  const handleCategoryPress = (item: Category) => {
    // Route genre-like tiles to GenreScreen, category-like to CategoryScreen
    const genreNames = new Set(genres.map(g => g.toLowerCase()));
    if (genreNames.has(item.name.toLowerCase())) {
      navigation.navigate('Genre', {genreName: item.name});
    } else {
      navigation.navigate('Category', {categoryId: item.id, categoryName: item.name});
    }
  };

  // ── FOCUSED / SEARCH MODE ─────────────────────────────────────────────
  if (isFocused) {
    return (
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.focusedHeader}>
          <TouchableOpacity
            onPress={() => {
              setIsFocused(false);
              setQuery('');
            }}
            style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color={colors.white} />
          </TouchableOpacity>
          <TextInput
            autoFocus
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Artists, songs, or podcasts"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.focusedInput}
            value={query}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results / Recents */}
        <ScrollView
          contentContainerStyle={styles.focusedContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!query.trim() ? (
            // ── History ──
            history.length > 0 ? (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recent searches</Text>
                  <TouchableOpacity
                    onPress={() =>
                      history.forEach(item => user && deleteSearchQuery(user.id, item))
                    }>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                {history.map(item => (
                  <View key={item} style={styles.historyRow}>
                    <View style={styles.historyIconWrap}>
                      <Icon name="history" size={20} color={colors.textMuted} />
                    </View>
                    <TouchableOpacity
                      style={styles.historyTextBtn}
                      onPress={() => setQuery(item)}>
                      <Text style={styles.historyLabel}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => user && deleteSearchQuery(user.id, item)}>
                      <Icon name="close" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.hintText}>Find podcasts, artists, songs, and more.</Text>
            )
          ) : results.length > 0 ? (
            // ── Results ──
            <>
              <Text style={styles.sectionTitle}>Top results</Text>
              {results.map(track => (
                <TrackRow
                  item={track}
                  key={track.id}
                  onPress={() => {
                    playTrack(track);
                    handleSearchSubmit();
                  }}
                  onIconPress={() => setSelectedTrack(track)}
                  trailingIcon="dots-vertical"
                />
              ))}
            </>
          ) : (
            <View style={styles.noResultsWrap}>
              <Text style={styles.noResultsTitle}>
                No results found for "{query}"
              </Text>
              <Text style={styles.noResultsSub}>
                Try different keywords or check your spelling.
              </Text>
            </View>
          )}
        </ScrollView>

        <AddToPlaylistModal
          visible={!!selectedTrack}
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      </View>
    );
  }

  // ── BROWSE MODE ───────────────────────────────────────────────────────
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Search</Text>
        <Icon color={colors.text} name="camera-outline" size={28} />
      </View>

      {/* Search bar (tap to focus) */}
      <Pressable style={styles.searchBox} onPress={() => setIsFocused(true)}>
        <Icon color={colors.black} name="magnify" size={22} />
        <Text style={styles.searchPlaceholder}>
          What do you want to listen to?
        </Text>
      </Pressable>

      {/* Discover something new */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Discover something new</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.discoverScroll}>
        {genres.slice(0, 4).map(genre => (
          <TouchableOpacity 
            key={genre} 
            style={styles.discoverCard}
            onPress={() => navigation.navigate('Genre', {genreName: genre})}
          >
            <View style={styles.discoverIconWrap}>
              <Icon name="play" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.discoverText}>#{genre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Browse All grid */}
      <Text style={styles.sectionTitle}>Browse all</Text>
      <FlatList
        data={browseItems}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({item, index}) => (
          <CategoryTile
            index={index}
            item={item}
            onPress={() => handleCategoryPress(item)}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
  },
  // ── Browse mode ──────────────────────────
  content: {
    padding: spacing.lg,
    paddingTop: 52,
    paddingBottom: 170,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  screenTitle: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '900',
  },
  searchBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  searchPlaceholder: {
    color: colors.black,
    fontSize: typography.body,
    fontWeight: '600',
    opacity: 0.7,
  },
  discoverScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  discoverCard: {
    backgroundColor: '#282828',
    width: 130,
    height: 200,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  discoverIconWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  // ── Focused / Search mode ─────────────────
  focusedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 52,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    padding: spacing.xs,
  },
  focusedInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  focusedContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  clearAllText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  historyIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  historyTextBtn: {
    flex: 1,
  },
  historyLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  noResultsWrap: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  noResultsTitle: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
    textAlign: 'center',
  },
  noResultsSub: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
