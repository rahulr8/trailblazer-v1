import { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { X, Award } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function BadgeDetailModal() {
  const { colors, shadows } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleDismiss = useCallback(() => {
    router.back();
  }, []);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.75} />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['50%']}
      enablePanDownToClose
      onClose={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: BorderRadius['3xl'],
        borderTopRightRadius: BorderRadius['3xl'],
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.textSecondary,
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Achievement</Text>
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
            onPress={handleDismiss}
          >
            <X size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.badgeIcon, { backgroundColor: colors.accent + '20' }, shadows.md]}>
            <Award size={48} color={colors.accent} />
          </View>
          <Text style={[styles.badgeName, { color: colors.textPrimary }]}>Trailblazer</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Complete 10 different trails to earn this badge.
          </Text>
          <View style={[styles.progressContainer, { backgroundColor: colors.progressTrack }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: '70%' }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>7 of 10 trails</Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
  badgeIcon: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: 13,
  },
});
