import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {ScreenHeader} from '../../components/ScreenHeader';
import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {useCatalog} from '../catalog/CatalogContext';
import {
  addCategory,
  createArtist,
  createPlaylist,
  createTrack,
  deleteCategory,
  deletePlaylist,
  deleteTrack,
  getCategories,
  getStats,
  getUsers,
  setAdminStatus,
  uploadToCloudinary,
} from './adminService';
import {AppUser} from '../auth/authService';

type AdminView = 'dashboard' | 'add_track' | 'list_tracks' | 'categories' | 'playlists' | 'users' | 'add_artist';

export function AdminScreen() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({tracks: 0, playlists: 0, users: 0, categories: 0});
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [userList, setUserList] = useState<AppUser[]>([]);
  const {tracks: allTracks, playlists: allPlaylists, refresh} = useCatalog();

  // Add Track Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [audioFile, setAudioFile] = useState<{uri: string; name: string} | null>(null);
  const [coverFile, setCoverFile] = useState<{uri: string; name: string} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add Artist Form State
  const [artistName, setArtistName] = useState('');
  const [artistCover, setArtistCover] = useState<{uri: string; name: string} | null>(null);

  // Add Playlist Form State
  const [pTitle, setPTitle] = useState('');
  const [pSubtitle, setPSubtitle] = useState('');
  const [pCoverFile, setPCoverFile] = useState<{uri: string; name: string} | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [s, cats, u] = await Promise.all([getStats(), getCategories(), getUsers()]);
      setStats(s);
      setCategories(cats);
      setUserList(u);
      if (cats.length > 0) setSelectedCategory(cats[0].name);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    await setAdminStatus(userId, !currentStatus);
    loadInitialData();
  };

  const handlePickArtistCover = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (res.assets?.[0]) {
      setArtistCover({uri: res.assets[0].uri!, name: res.assets[0].fileName || 'artist.jpg'});
    }
  };

  const handleSubmitArtist = async () => {
    if (!artistName || !artistCover) return;
    setIsLoading(true);
    try {
      const coverUrl = await uploadToCloudinary(artistCover.uri, 'image', p => setUploadProgress(p));
      await createArtist({name: artistName, coverUrl});
      Alert.alert('Succès', 'Artiste ajouté !');
      setArtistName(''); setArtistCover(null);
      setActiveView('dashboard');
      loadInitialData();
    } catch (e) {
      Alert.alert('Erreur', 'Échec de l’ajout');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteTrack = (id: string, name: string) => {
    Alert.alert('Supprimer', `Voulez-vous supprimer "${name}" ?`, [
      {text: 'Annuler', style: 'cancel'},
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteTrack(id);
          refresh();
          loadInitialData();
        },
      },
    ]);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    await addCategory(newCatName);
    setNewCatName('');
    loadInitialData();
  };

  const handlePickAudio = async () => {
    try {
      const [res] = await pick({type: ['audio/*'], mode: 'import'});
      if (res) {
        setAudioFile({uri: res.uri, name: res.name || 'audio.mp3'});
      }
    } catch (err) {
      if (!(isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED)) {
        Alert.alert('Erreur', 'Sélection échouée');
      }
    }
  };

  const handlePickCover = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (res.assets?.[0]) {
      setCoverFile({uri: res.assets[0].uri!, name: res.assets[0].fileName || 'cover.jpg'});
    }
  };

  const handlePickPCover = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (res.assets?.[0]) {
      setPCoverFile({uri: res.assets[0].uri!, name: res.assets[0].fileName || 'cover.jpg'});
    }
  };

  const handleSubmitPlaylist = async () => {
    if (!pTitle || !pSubtitle || !pCoverFile) {
      Alert.alert('Champs requis', 'Veuillez tout remplir.');
      return;
    }
    setIsLoading(true);
    try {
      const coverUrl = await uploadToCloudinary(pCoverFile.uri, 'image', p => setUploadProgress(p));
      await createPlaylist({
        title: pTitle,
        subtitle: pSubtitle,
        category: 'Music',
        coverUrl,
      });
      Alert.alert('Succès', 'Playlist créée !');
      setPTitle(''); setPSubtitle(''); setPCoverFile(null);
      refresh();
      loadInitialData();
    } catch (e) {
      Alert.alert('Erreur', 'Échec de la création');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer la playlist "${name}" ?`, [
      {text: 'Annuler', style: 'cancel'},
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deletePlaylist(id);
          refresh();
          loadInitialData();
        },
      },
    ]);
  };

  const handleSubmitTrack = async () => {
    if (!title || !artist || !audioFile || !coverFile) {
      Alert.alert('Champs requis', 'Veuillez tout remplir.');
      return;
    }
    setIsLoading(true);
    try {
      const coverUrl = await uploadToCloudinary(coverFile.uri, 'image', p => setUploadProgress(p * 0.2));
      const audioUrl = await uploadToCloudinary(audioFile.uri, 'video', p => setUploadProgress(0.2 + p * 0.8));
      await createTrack({title, artist, album, category: selectedCategory, audioUrl, coverUrl, durationMs: 180000});
      Alert.alert('Succès', 'Morceau publié !');
      setTitle(''); setArtist(''); setAlbum(''); setAudioFile(null); setCoverFile(null);
      setActiveView('dashboard');
      refresh();
      loadInitialData();
    } catch (e) {
      Alert.alert('Erreur', 'Échec de la publication');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.statsGrid}>
        <StatCard iconName="music" label="Titres" value={stats.tracks} />
        <StatCard iconName="account-group" label="Users" value={stats.users} />
        <StatCard iconName="playlist-music" label="Listes" value={stats.playlists} />
        <StatCard iconName="shape" label="Genres" value={stats.categories} />
      </View>

      <Text style={styles.sectionTitle}>Modules de Production</Text>
      <MenuButton icon="plus-circle" label="Publier un nouveau Son" onPress={() => setActiveView('add_track')} />
      <MenuButton icon="account-star" label="Gérer un Artiste" onPress={() => setActiveView('add_artist')} />
      <MenuButton icon="playlist-plus" label="Créer une Playlist" onPress={() => setActiveView('playlists')} />

      <Text style={[styles.sectionTitle, {marginTop: spacing.xl}]}>Modules de Contrôle</Text>
      <MenuButton icon="format-list-bulleted" label="Bibliothèque Globale" onPress={() => setActiveView('list_tracks')} />
      <MenuButton icon="tag-multiple" label="Genres & Catégories" onPress={() => setActiveView('categories')} />
      <MenuButton icon="security" label="Gestion des Permissions" onPress={() => setActiveView('users')} />
    </ScrollView>
  );

  const renderAddArtist = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={styles.backBtn}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Nouvel Artiste</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nom de l'artiste" placeholderTextColor={colors.textMuted} style={styles.input} value={artistName} onChangeText={setArtistName} />
        <TouchableOpacity style={styles.fileBtn} onPress={handlePickArtistCover}>
          <Icon name="image" size={20} color={artistCover ? colors.primary : colors.white} />
          <Text numberOfLines={1} style={styles.fileBtnText}>{artistCover ? artistCover.name : 'Photo de profil'}</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isLoading} style={[styles.mainBtn, isLoading && styles.disabled]} onPress={handleSubmitArtist}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Enregistrer l'Artiste</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.flex1}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={[styles.backBtn, {margin: spacing.lg}]}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <FlatList
        data={userList}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: spacing.lg}}
        renderItem={({item}) => (
          <View style={styles.trackItem}>
            <View style={styles.flex1}>
              <Text style={styles.trackTitle}>{item.displayName}</Text>
              <Text style={styles.trackArtist}>{item.email}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.roleBadge, item.isAdmin && styles.adminBadge]}
              onPress={() => handleToggleAdmin(item.id, !!item.isAdmin)}
            >
              <Text style={styles.roleText}>{item.isAdmin ? 'ADMIN' : 'USER'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderAddTrack = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={styles.backBtn}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Publication</Text>
      <View style={styles.form}>
        <TextInput placeholder="Titre" placeholderTextColor={colors.textMuted} style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput placeholder="Artiste" placeholderTextColor={colors.textMuted} style={styles.input} value={artist} onChangeText={setArtist} />
        <TextInput placeholder="Album" placeholderTextColor={colors.textMuted} style={styles.input} value={album} onChangeText={setAlbum} />
        
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Genre :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPicker}>
            {categories.map(c => (
              <TouchableOpacity 
                key={c.id} 
                onPress={() => setSelectedCategory(c.name)}
                style={[styles.catChip, selectedCategory === c.name && styles.activeChip]}
              >
                <Text style={styles.catText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fileRow}>
          <TouchableOpacity style={styles.fileBtn} onPress={handlePickAudio}>
            <Icon name="music-note" size={20} color={audioFile ? colors.primary : colors.white} />
            <Text numberOfLines={1} style={styles.fileBtnText}>{audioFile ? audioFile.name : 'Choisir MP3'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fileBtn} onPress={handlePickCover}>
            <Icon name="image" size={20} color={coverFile ? colors.primary : colors.white} />
            <Text numberOfLines={1} style={styles.fileBtnText}>{coverFile ? coverFile.name : 'Choisir Image'}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, {width: `${uploadProgress * 100}%`}]} />
            <Text style={styles.progressText}>{Math.round(uploadProgress * 100)}%</Text>
          </View>
        )}

        <TouchableOpacity disabled={isLoading} style={[styles.mainBtn, isLoading && styles.disabled]} onPress={handleSubmitTrack}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Lancer la Production</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderListTracks = () => (
    <View style={styles.flex1}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={[styles.backBtn, {margin: spacing.lg}]}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <FlatList
        data={allTracks}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: spacing.lg}}
        renderItem={({item}) => (
          <View style={styles.trackItem}>
            <View style={styles.flex1}>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteTrack(item.id, item.title)}>
              <Icon name="trash-can-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderCategories = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={styles.backBtn}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Genres Musicaux</Text>
      
      <View style={styles.addCatRow}>
        <TextInput 
          placeholder="Nouveau genre..." 
          placeholderTextColor={colors.textMuted} 
          style={[styles.input, styles.flex1]} 
          value={newCatName} 
          onChangeText={setNewCatName} 
        />
        <TouchableOpacity style={styles.squareBtn} onPress={handleAddCategory}>
          <Icon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {categories.map(c => (
        <View key={c.id} style={styles.catItem}>
          <Text style={styles.catItemName}>{c.name}</Text>
          <TouchableOpacity onPress={() => deleteCategory(c.id).then(loadInitialData)}>
            <Icon name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderPlaylists = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => setActiveView('dashboard')} style={styles.backBtn}>
        <Icon name="arrow-left" size={24} color={colors.white} />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Nouvelle Playlist</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nom de la Playlist" placeholderTextColor={colors.textMuted} style={styles.input} value={pTitle} onChangeText={setPTitle} />
        <TextInput placeholder="Description" placeholderTextColor={colors.textMuted} style={styles.input} value={pSubtitle} onChangeText={setPSubtitle} />
        
        <TouchableOpacity style={styles.fileBtn} onPress={handlePickPCover}>
          <Icon name="image" size={20} color={pCoverFile ? colors.primary : colors.white} />
          <Text numberOfLines={1} style={styles.fileBtnText}>{pCoverFile ? pCoverFile.name : 'Choisir Cover'}</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={isLoading} style={[styles.mainBtn, isLoading && styles.disabled]} onPress={handleSubmitPlaylist}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Créer la Playlist</Text>}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, {marginTop: spacing.xl}]}>Toutes les Playlists</Text>
      {allPlaylists.map(p => (
        <View key={p.id} style={styles.catItem}>
          <Text style={styles.catItemName}>{p.title}</Text>
          <TouchableOpacity onPress={() => handleDeletePlaylist(p.id, p.title)}>
            <Icon name="delete" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Usine Spotify Clone" />
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'add_track' && renderAddTrack()}
      {activeView === 'list_tracks' && renderListTracks()}
      {activeView === 'categories' && renderCategories()}
      {activeView === 'playlists' && renderPlaylists()}
      {activeView === 'users' && renderUsers()}
      {activeView === 'add_artist' && renderAddArtist()}
    </View>
  );
}

function StatCard({iconName, label, value}: {iconName: string; label: string; value: number}) {
  return (
    <View style={styles.statCard}>
      <Icon name={iconName} size={24} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({icon, label, onPress}: {icon: string; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
      <View style={styles.menuIconBox}>
        <Icon name={icon} size={24} color={colors.white} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDeep },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  flex1: { flex: 1 },
  sectionTitle: { color: colors.white, fontSize: typography.title, fontWeight: '900', marginVertical: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: '47%', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: typography.display, fontWeight: '900', marginTop: spacing.sm },
  statLabel: { color: colors.textMuted, fontSize: typography.label, fontWeight: '700' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  menuIconBox: { width: 44, height: 44, backgroundColor: colors.primaryDeep, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  menuLabel: { flex: 1, color: colors.white, fontSize: typography.body, fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  backText: { color: colors.white, fontWeight: '800' },
  form: { gap: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, color: colors.white },
  label: { color: colors.white, fontWeight: '800', marginBottom: spacing.xs },
  catPicker: { flexDirection: 'row' },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.surface, borderRadius: radius.full, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.surface },
  activeChip: { borderColor: colors.primary, backgroundColor: colors.primaryDeep },
  catText: { color: colors.white, fontSize: typography.label, fontWeight: '800' },
  fileRow: { flexDirection: 'row', gap: spacing.md },
  fileBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.textMuted },
  fileBtnText: { color: colors.white, fontSize: 11, flex: 1 },
  mainBtn: { backgroundColor: colors.primary, padding: spacing.lg, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
  btnText: { color: colors.white, fontWeight: '900' },
  disabled: { opacity: 0.5 },
  progressContainer: { height: 40, backgroundColor: colors.surface, borderRadius: radius.full, justifyContent: 'center', overflow: 'hidden' },
  progressBar: { position: 'absolute', height: '100%', backgroundColor: colors.primary },
  progressText: { textAlign: 'center', color: colors.white, fontWeight: '900', zIndex: 1 },
  trackItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  trackTitle: { color: colors.white, fontWeight: '800' },
  trackArtist: { color: colors.textMuted, fontSize: 12 },
  addCatRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  squareBtn: { width: 50, height: 50, backgroundColor: colors.primary, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  catItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  catItemName: { color: colors.white, fontWeight: '700' },
  pickerContainer: { marginVertical: spacing.xs },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.sm,
  },
  adminBadge: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  roleText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
});
