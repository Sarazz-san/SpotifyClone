import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {CategoryTile} from '../../components/CategoryTile';
import {EmptyState} from '../../components/EmptyState';
import {TrackRow} from '../../components/TrackRow';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {useCatalog} from '../catalog/CatalogContext';
import {usePlayer} from '../player/PlayerContext';

import {useAuth} from '../auth/AuthContext';
import {deleteSearchQuery, saveSearchQuery, subscribeToSearchHistory} from '../user/userService';

export function SearchScreen() {
  const {user} = useAuth();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const {categories, tracks} = useCatalog();
  const {playTrack} = usePlayer();

  useEffect(() => {
    if (user) return subscribeToSearchHistory(user.id, setHistory);
  }, [user]);

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

  if (isFocused) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, {paddingHorizontal: spacing.lg, paddingTop: 50}]}>
          <TouchableOpacity onPress={() => { setIsFocused(false); setQuery(''); }}>
            <Icon name="arrow-left" size={28} color={colors.white} />
          </TouchableOpacity>
          <TextInput
            autoFocus
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            placeholder="What do you want to listen to?"
            placeholderTextColor={colors.textMuted}
            style={styles.focusedInput}
            value={query}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {!query.trim() ? (
            <>
              <Text style={styles.sectionTitle}>Recents</Text>
              {history.map(item => (
                <View key={item} style={styles.historyItem}>
                  <Icon name="magnify" size={24} color={colors.textMuted} style={{marginRight: spacing.md}} />
                  <TouchableOpacity style={{flex: 1}} onPress={() => setQuery(item)}>
                    <Text style={styles.historyTitle}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => user && deleteSearchQuery(user.id, item)}>
                    <Icon name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            results.map(track => (
              <TrackRow
                item={track}
                key={track.id}
                onPress={() => {
                  playTrack(track);
                  handleSearchSubmit();
                }}
                trailingIcon="play"
              />
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.title}>Search</Text>
        <Icon color={colors.text} name="camera-outline" size={30} />
      </View>

      <Pressable style={styles.searchBox} onPress={() => setIsFocused(true)}>
        <Icon color={colors.black} name="magnify" size={32} />
        <Text style={styles.placeholderText}>What do you want to listen to?</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Discover something new</Text>
      {categories.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.slice(0, 5).map(category => (
            <Pressable key={category.id} style={styles.discoveryCard}>
              <Icon
                color="rgba(255,255,255,0.65)"
                name="play-box-outline"
                size={72}
              />
              <Text numberOfLines={1} style={styles.discoveryText}>
                #{category.name.toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="Catalogue indisponible"
          message="Vérifiez votre connexion pour découvrir les dernières nouveautés."
        />
      )}

      <Text style={styles.sectionTitle}>Browse all</Text>
      {categories.length ? (
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <CategoryTile 
              index={index} 
              key={category.id} 
              item={category} 
              onPress={() => {
                setQuery(category.name);
                setIsFocused(true);
              }}
            />
          ))}
        </View>
      ) : null}

      {query.trim() ? (
        <>
          <Text style={styles.sectionTitle}>Results</Text>
          {results.length ? (
            results.map(track => (
              <TrackRow
                item={track}
                key={track.id}
                onPress={() => playTrack(track)}
                trailingIcon="play"
              />
            ))
          ) : (
            <EmptyState
              title="No results"
              message="Try another track, artist, album, or category."
            />
          )}
        </>
      ) : null}
    </ScrollView>
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
  searchBox: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    color: colors.black,
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
  discoveryCard: {
    width: 188,
    height: 282,
    justifyContent: 'flex-end',
    marginRight: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceHigh,
  },
  discoveryText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  focusedInput: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  historyCover: {
    width: 52,
    height: 52,
    borderRadius: radius.xs,
    marginRight: spacing.md,
  },
  historyTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  clearBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: radius.full,
  },
  clearText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
