import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { Plus } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function HomeScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: Platform.OS === 'ios' ? 100 : insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back!</Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            shadows.md,
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>60-Day Challenge</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Track your outdoor activities
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: '45%' }]} />
          </View>

          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Day 27 of 60 • 45% complete
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button onPress={() => router.push('/(modals)/log-activity')}>
            <Plus size={20} color="#000" style={{ marginRight: 8 }} />
            Log Activity
          </Button>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            shadows.md,
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>12.5</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>8,432</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.highlight }]}>47</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>minutes</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            shadows.md,
          ]}
          onPress={() => router.push('/chat')}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Ask Parker</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Get trail recommendations from our AI assistant
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: -4,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressLabel: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    marginVertical: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
