import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Button } from 'heroui-native';
import { Crown, X, Check } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function UpgradeModal() {
  const { colors, shadows, isDark } = useTheme();

  const handleDismiss = () => router.back();

  const features = [
    'Exclusive partner rewards',
    'Priority trail reservations',
    'Ad-free experience',
    'Extended activity history',
  ];

  return (
    <Pressable style={styles.backdrop} onPress={handleDismiss}>
      <BlurView intensity={isDark ? 40 : 20} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.gold + '40' },
            shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
            onPress={handleDismiss}
          >
            <X size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.iconContainer, { backgroundColor: colors.gold + '20' }]}>
            <Crown size={40} color={colors.gold} />
          </View>

          <Text style={[styles.title, { color: colors.gold }]}>Upgrade to Platinum</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock premium features and exclusive rewards
          </Text>

          <View style={styles.features}>
            {features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={[styles.checkIcon, { backgroundColor: colors.gold + '20' }]}>
                  <Check size={14} color={colors.gold} />
                </View>
                <Text style={[styles.featureText, { color: colors.textPrimary }]}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.textPrimary }]}>$9.99</Text>
            <Text style={[styles.period, { color: colors.textSecondary }]}>/month</Text>
          </View>

          <Button onPress={handleDismiss}>Get Platinum</Button>

          <Pressable onPress={handleDismiss}>
            <Text style={[styles.maybeLater, { color: colors.textSecondary }]}>Maybe later</Text>
          </Pressable>
        </Pressable>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  features: {
    width: '100%',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
  },
  maybeLater: {
    fontSize: 14,
    marginTop: Spacing.md,
  },
});
