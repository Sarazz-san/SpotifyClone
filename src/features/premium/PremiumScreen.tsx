import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';
import {getFirebaseStatus} from '../../firebase/firebaseService';

const benefits = [
  'Streaming haute qualité',
  'Lecture en arrière-plan',
  'Catalogue complet et illimité',
];

export function PremiumScreen() {
  const status = getFirebaseStatus();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <LinearGradient
        colors={[colors.primaryContainer, colors.primaryDeep, colors.backgroundDeep]}
        style={styles.hero}>
        <Icon color={colors.white} name="spotify" size={42} />
        <Text style={styles.eyebrow}>Spotify Clone</Text>
        <Text style={styles.title}>Expérience audio activée</Text>
        <Text style={styles.subtitle}>
          Découvrez toutes les fonctionnalités disponibles dans votre application.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>État des services</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIndicator,
              status.mode === 'firebase'
                ? styles.statusOnline
                : styles.statusOffline,
            ]}
          />
          <Text style={styles.statusText}>
            Mode: {status.mode === 'firebase' ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {status.mode === 'firebase' 
            ? 'Vous êtes connecté aux services audio.' 
            : 'Certaines fonctionnalités en ligne sont indisponibles.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bénéfices</Text>
        {benefits.map(benefit => (
          <View key={benefit} style={styles.row}>
            <Icon color={colors.primary} name="check-circle" size={24} />
            <Text style={styles.rowText}>{benefit}</Text>
          </View>
        ))}
      </View>
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
  hero: {
    minHeight: 340,
    justifyContent: 'flex-end',
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.white,
    fontSize: typography.label,
    fontWeight: '900',
    marginTop: spacing.xl,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: typography.display,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  card: {
    gap: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
  },
  statusDescription: {
    color: colors.textMuted,
    fontSize: typography.label,
    lineHeight: 18,
  },
  seedButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  seedButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
  },
});
