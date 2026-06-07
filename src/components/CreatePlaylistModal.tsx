import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { createPlaylist } from '../features/admin/adminService';
import { useCatalog } from '../features/catalog/CatalogContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CreatePlaylistModal({ visible, onClose }: Props) {
  const [playlistName, setPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { refresh } = useCatalog();

  const handleCreate = async () => {
    if (!playlistName.trim()) return;
    
    setIsCreating(true);
    try {
      await createPlaylist({
        title: playlistName.trim(),
        subtitle: 'Created by User',
        category: 'playlist',
        coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop', // default cover
      });
      await refresh();
      setPlaylistName('');
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Give your playlist a name</Text>
          
          <TextInput
            style={styles.input}
            value={playlistName}
            onChangeText={setPlaylistName}
            placeholder="My awesome playlist"
            placeholderTextColor={colors.textMuted}
            autoFocus
            selectionColor={colors.primary}
          />

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onClose}
              disabled={isCreating}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, !playlistName.trim() && styles.buttonDisabled]} 
              onPress={handleCreate}
              disabled={!playlistName.trim() || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: '#282828',
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
  },
  createButtonText: {
    color: colors.primary,
  },
});
