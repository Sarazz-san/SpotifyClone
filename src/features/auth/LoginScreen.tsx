import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';
import {useAuth} from './AuthContext';

const logo = require('../../assets/images/logo_spotify_green.png');

export function LoginScreen() {
  const {error, isLoading, login, register} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const authMode = isFirebaseConfigured() ? 'Connexion sécurisée' : 'Accès limité';

  const handleAuth = async () => {
    if (!email.includes('@') || password.length < 6) {
      Alert.alert('Validation', 'Veuillez saisir un email valide et un mot de passe de 6 caractères minimum.');
      return;
    }

    if (isRegisterMode) {
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logoShell}>
          <Image source={logo} style={styles.logo} />
        </View>
        <Text style={styles.badge}>{authMode}</Text>
        <Text style={styles.title}>Spotify Clone</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode 
            ? 'Créez un compte pour sauvegarder vos playlists et vos titres favoris.' 
            : 'Connectez-vous pour accéder à votre musique et profiter de l\'expérience complète.'}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textDim}
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Mot de passe"
          placeholderTextColor={colors.textDim}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <Pressable
          disabled={isLoading}
          style={[styles.primaryButton, isLoading ? styles.disabled : null]}
          onPress={handleAuth}>
          <Text style={styles.primaryText}>
            {isLoading ? 'Chargement...' : (isRegisterMode ? 'S’inscrire' : 'Se connecter')}
          </Text>
        </Pressable>

        <Pressable
          disabled={isLoading}
          style={styles.secondaryButton}
          onPress={() => setIsRegisterMode(!isRegisterMode)}>
          <Text style={styles.secondaryText}>
            {isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Nouveau ici ? Créer un compte'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  brand: {
    flex: 1,
    justifyContent: 'center',
  },
  logoShell: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(168,85,247,0.14)',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 70,
    height: 70,
  },
  badge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    color: colors.black,
    backgroundColor: colors.primary,
    fontSize: typography.label,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  input: {
    height: 54,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: typography.body,
  },
  primaryButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.64,
  },
  error: {
    color: colors.danger,
    fontSize: typography.small,
    lineHeight: 20,
  },
});
