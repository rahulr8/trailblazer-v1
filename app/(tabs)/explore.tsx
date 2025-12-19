import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function ExploreScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const adventures = [
    { id: 1, name: 'Garibaldi Lake Trail', location: 'Squamish', difficulty: 'Moderate' },
    { id: 2, name: 'Joffre Lakes', location: 'Pemberton', difficulty: 'Easy' },
    { id: 3, name: 'Grouse Grind', location: 'North Vancouver', difficulty: 'Hard' },
    { id: 4, name: 'Stawamus Chief', location: 'Squamish', difficulty: 'Moderate' },
  ];

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Discover BC Parks adventures
        </Text>

        <View style={styles.grid}>
          {adventures.map((adventure) => (
            <View
              key={adventure.id}
              style={[
                styles.card,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                shadows.md,
              ]}
            >
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.glassBg }]} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {adventure.name}
                </Text>
                <Text style={[styles.cardLocation, { color: colors.textSecondary }]}>
                  {adventure.location}
                </Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        adventure.difficulty === 'Hard'
                          ? colors.danger + '20'
                          : adventure.difficulty === 'Moderate'
                            ? colors.highlight + '20'
                            : colors.accent + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      {
                        color:
                          adventure.difficulty === 'Hard'
                            ? colors.danger
                            : adventure.difficulty === 'Moderate'
                              ? colors.highlight
                              : colors.accent,
                      },
                    ]}
                  >
                    {adventure.difficulty}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: -8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: '48%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
  },
  cardContent: {
    padding: Spacing.md,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardLocation: {
    fontSize: 13,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
