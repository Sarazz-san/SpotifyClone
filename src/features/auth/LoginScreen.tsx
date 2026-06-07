import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';
import {resetPassword} from './authService';
import {useAuth} from './AuthContext';
import {friendlyError} from '../../utils/errorMessages';

const logo = require('../../assets/images/logo_spotify_green.png');

type Mode = 'login' | 'register' | 'reset';

export function LoginScreen() {
  const {error, isLoading, isInitializing, login, register} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 60, useNativeDriver: true}),
    ]).start();
  };

  // Show splash while Firebase initializes
  if (isInitializing) {
    return (
      <LinearGradient
        colors={['#121212', '#0d0d0d']}
        style={styles.splash}>
        <Image source={logo} style={styles.splashLogo} />
        <ActivityIndicator color={colors.primary} size="large" style={{marginTop: spacing.xl}} />
      </LinearGradient>
    );
  }

  const handleAuth = async () => {
    if (!email.includes('@')) {
      shake();
      Alert.alert('Email invalide', 'Veuillez entrer un email valide.');
      return;
    }
    if (password.length < 6) {
      shake();
      Alert.alert('Mot de passe trop court', 'Minimum 6 caractères requis.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      shake();
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (mode === 'register') {
      await register(email, password, displayName || undefined);
    } else {
      await login(email, password);
    }
  };

  const handleReset = async () => {
    if (!email.includes('@')) {
      Alert.alert('Email invalide', 'Entrez votre email pour réinitialiser votre mot de passe.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (e) {
      Alert.alert('Erreur', friendlyError(e, 'Impossible d\'envoyer le lien. Vérifiez votre email.'));
    } finally {
      setResetLoading(false);
    }
  };

  if (mode === 'reset') {
    return (
      <LinearGradient colors={['#121212', '#0d0d0d']} style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}>
          <View style={styles.brand}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </Text>
          </View>

          {resetSent ? (
            <View style={styles.form}>
              <View style={styles.successBox}>
                <Icon name="check-circle" size={32} color={colors.primary} />
                <Text style={styles.successText}>
                  Lien envoyé ! Vérifiez votre boîte email.
                </Text>
              </View>
              <Pressable style={styles.primaryButton} onPress={() => {setMode('login'); setResetSent(false);}}>
                <Text style={styles.primaryText}>Retour à la connexion</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Icon name="email-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputField}
                  value={email}
                />
              </View>
              <Pressable
                disabled={resetLoading}
                style={[styles.primaryButton, resetLoading && styles.disabled]}
                onPress={handleReset}>
                {resetLoading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.primaryText}>Envoyer le lien</Text>}
              </Pressable>
              <TouchableOpacity onPress={() => setMode('login')} style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>← Retour</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#121212', '#0d0d0d']} style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>

          <View style={styles.brand}>
            <View style={styles.logoShell}>
              <Image source={logo} style={styles.logo} />
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Icon name="shield-check" size={12} color={colors.black} />
                <Text style={styles.badgeText}>
                  {isFirebaseConfigured() ? 'Connexion sécurisée' : 'Mode démo'}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>
              {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Connectez-vous pour accéder à votre musique.'
                : 'Rejoignez et profitez de votre musique partout.'}
            </Text>
          </View>

          <Animated.View style={[styles.form, {transform: [{translateX: shakeAnim}]}]}>

            {mode === 'register' && (
              <View style={styles.inputWrap}>
                <Icon name="account-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setDisplayName}
                  placeholder="Nom d'affichage (optionnel)"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputField}
                  value={displayName}
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Icon name="email-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                style={styles.inputField}
                value={email}
              />
            </View>

            <View style={styles.inputWrap}>
              <Icon name="lock-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                onChangeText={setPassword}
                placeholder="Mot de passe"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                style={styles.inputField}
                value={password}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <View style={styles.inputWrap}>
                <Icon name="lock-check-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={styles.inputField}
                  value={confirmPassword}
                />
              </View>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle-outline" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={isLoading}
              style={[styles.primaryButton, isLoading && styles.disabled]}
              onPress={handleAuth}>
              {isLoading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.primaryText}>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  </Text>}
            </Pressable>

            {mode === 'login' && (
              <TouchableOpacity onPress={() => setMode('reset')} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              disabled={isLoading}
              style={styles.secondaryButton}
              onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={styles.secondaryText}>
                {mode === 'login'
                  ? 'Nouveau ici ? Créer un compte'
                  : 'Déjà un compte ? Se connecter'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 100,
    height: 100,
  },
  brand: {
    marginBottom: spacing.xxl,
  },
  logoShell: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(30,215,96,0.12)',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.black,
    fontSize: typography.label,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.md,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    height: '100%',
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: typography.small,
    lineHeight: 20,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(30,215,96,0.12)',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  successText: {
    flex: 1,
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  primaryButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.black,
    fontSize: typography.body,
    fontWeight: '900',
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: typography.small,
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.64,
  },
});
