import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Crown } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function RewardsScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const rewards = [
    { id: 1, name: 'Free Trail Map', partner: 'BC Parks', points: 100 },
    { id: 2, name: '15% Off Gear', partner: 'MEC', points: 250 },
    { id: 3, name: 'Free Coffee', partner: "Tim Hortons", points: 50 },
    { id: 4, name: 'Campsite Discount', partner: 'BC Parks', points: 500 },
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Rewards</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Redeem your activity points
        </Text>

        <View style={[styles.pointsCard, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.pointsLabel, { color: colors.primary }]}>Available Points</Text>
          <Text style={[styles.pointsValue, { color: colors.primary }]}>1,250</Text>
        </View>

        <Pressable
          style={[
            styles.upgradeCard,
            { backgroundColor: colors.gold + '15', borderColor: colors.gold + '40' },
          ]}
          onPress={() => router.push('/(modals)/upgrade')}
        >
          <Crown size={24} color={colors.gold} />
          <View style={styles.upgradeContent}>
            <Text style={[styles.upgradeTitle, { color: colors.gold }]}>Upgrade to Platinum</Text>
            <Text style={[styles.upgradeSubtitle, { color: colors.textSecondary }]}>
              Unlock exclusive rewards
            </Text>
          </View>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Available Rewards</Text>

        <View style={styles.rewardsList}>
          {rewards.map((reward) => (
            <Pressable
              key={reward.id}
              style={[
                styles.rewardCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                shadows.sm,
              ]}
              onPress={() => router.push({ pathname: '/(modals)/reward-detail', params: { id: reward.id } })}
            >
              <View style={[styles.rewardIcon, { backgroundColor: colors.glassBg }]} />
              <View style={styles.rewardContent}>
                <Text style={[styles.rewardName, { color: colors.textPrimary }]}>{reward.name}</Text>
                <Text style={[styles.rewardPartner, { color: colors.textSecondary }]}>
                  {reward.partner}
                </Text>
              </View>
              <View style={[styles.pointsBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.pointsBadgeText, { color: colors.accent }]}>
                  {reward.points} pts
                </Text>
              </View>
            </Pressable>
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
  pointsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 40,
    fontWeight: '700',
    marginTop: 4,
  },
  upgradeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  rewardsList: {
    gap: Spacing.md,
  },
  rewardCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  rewardPartner: {
    fontSize: 13,
    marginTop: 2,
  },
  pointsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
