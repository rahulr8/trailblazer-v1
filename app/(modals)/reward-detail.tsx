import { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Button } from 'heroui-native';
import { X } from 'lucide-react-native';

import { useTheme } from '@/contexts/theme-context';
import { Spacing, BorderRadius } from '@/constants';

export default function RewardDetailModal() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
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
      snapPoints={['70%']}
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reward Details</Text>
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
            onPress={handleDismiss}
          >
            <X size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.glassBg }]} />
          <Text style={[styles.rewardName, { color: colors.textPrimary }]}>Reward #{id}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Reward details and redemption instructions will appear here.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleDismiss}>Redeem Reward</Button>
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
    gap: Spacing.md,
  },
  imagePlaceholder: {
    height: 160,
    borderRadius: BorderRadius.xl,
  },
  rewardName: {
    fontSize: 22,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
});
