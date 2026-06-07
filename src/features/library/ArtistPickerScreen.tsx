import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image, TextInput, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {getFirestore, collection, getDocs} from '@react-native-firebase/firestore';

import {colors} from '../../constants/colors';
import {spacing, radius} from '../../constants/spacing';
import {useCatalog} from '../catalog/CatalogContext';
import {useAuth} from '../auth/AuthContext';
import {toggleFollowArtist, subscribeToFollowedArtists} from '../user/userService';

type Artist = {
  id: string;
  name: string;
  image: string;
};

export function ArtistPickerScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [dbArtists, setDbArtists] = useState<Artist[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const {tracks} = useCatalog();
  const {user} = useAuth();

  useEffect(() => {
    if (user) {
      return subscribeToFollowedArtists(user, artists => {
        setFollowedIds(artists.map(a => a.id));
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'artists'));
        const artistsData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          image: doc.data().coverUrl || doc.data().imageUrl || `https://picsum.photos/seed/${doc.id}/200/200`,
        }));
        setDbArtists(artistsData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    fetchArtists();
  }, []);

  const allArtists = useMemo(() => {
    const catalogArtists: Artist[] = Array.from(new Set(tracks.map(t => t.artist))).map(name => {
      const track = tracks.find(t => t.artist === name);
      return {
        id: name,
        name,
        image: typeof track?.cover === 'number' ? `https://picsum.photos/seed/${name}/200/200` : (track as any)?.coverUrl || (track as any)?.cover?.uri || `https://picsum.photos/seed/${name}/200/200`,
      };
    });

    const combined = [...dbArtists];
    catalogArtists.forEach(ca => {
      if (!combined.some(a => a.name.toLowerCase() === ca.name.toLowerCase())) {
        combined.push(ca);
      }
    });

    return combined.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [dbArtists, search, tracks]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose more artists you like.</Text>
      
      <View style={styles.searchBar}>
        <Icon name="magnify" size={24} color={colors.text} />
        <TextInput 
          placeholder="Search" 
          placeholderTextColor={colors.textMuted} 
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={allArtists}
        numColumns={3}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => {
          const isSelected = followedIds.includes(item.id);
          return (
            <TouchableOpacity 
              style={styles.artistItem}
              onPress={() => toggleFollowArtist(user, item, isSelected)}
            >
              <View style={[styles.avatarContainer, isSelected && styles.avatarSelected]}>
                <Image source={{uri: item.image}} style={styles.avatar} />
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Icon name="check" size={16} color={colors.black} />
                  </View>
                )}
              </View>
              <Text style={styles.artistName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDeep, paddingTop: 60 },
  title: { color: colors.white, fontSize: 32, fontWeight: '900', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.white, 
    marginHorizontal: spacing.lg, 
    borderRadius: radius.sm, 
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.xl
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: 16, color: colors.black, fontWeight: '700' },
  listContent: { paddingHorizontal: spacing.md },
  artistItem: { flex: 1/3, alignItems: 'center', marginBottom: spacing.xl },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: spacing.sm },
  avatarSelected: { opacity: 0.8 },
  checkBadge: {
    position: 'absolute',
    bottom: 12,
    right: 4,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistName: { color: colors.white, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  doneBtn: { backgroundColor: colors.white, paddingHorizontal: 40, paddingVertical: 12, borderRadius: radius.full },
  doneText: { color: colors.black, fontWeight: '900', fontSize: 16 },
});
