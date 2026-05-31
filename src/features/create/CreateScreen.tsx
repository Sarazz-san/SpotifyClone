import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../../constants/colors';
import {radius, spacing} from '../../constants/spacing';
import {typography} from '../../constants/typography';

const steps = [
  'Partagez vos propres créations musicales',
  'Collaborez sur des playlists avec vos amis',
  'Découvrez de nouveaux talents émergents',
  'Contribuez à la communauté Spotify Clone',
];

export function CreateScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer</Text>
        <Icon color={colors.primary} name="plus-circle" size={38} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exprimez votre créativité</Text>
        <Text style={styles.cardText}>
          Les fonctionnalités de création et de mise en ligne directe seront bientôt disponibles.
        </Text>
      </View>

      {steps.map((step, index) => (
        <View key={step} style={styles.stepRow}>
          <View style={styles.stepIndex}>
            <Text style={styles.stepIndexText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
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
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '900',
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.headline,
    fontWeight: '900',
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  stepRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepIndex: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  stepIndexText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
});
