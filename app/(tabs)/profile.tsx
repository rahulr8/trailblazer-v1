import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { signOut } from "firebase/auth";
import { router } from "expo-router";

import { Award, ChevronRight, Link2, LogOut, Moon, Settings, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Spacing } from "@/constants";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { auth } from "@/lib/firebase";
import { useStravaConnection } from "@/lib/strava";

export default function ProfileScreen() {
  const { colors, shadows, isDark, toggleColorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { uid } = useAuth();
  const strava = useStravaConnection(uid);

  const handleSignOut = async () => {
    try {
      console.log("[Profile] Signing out...");
      await signOut(auth);
      console.log("[Profile] Sign out successful");
      router.replace("/login");
    } catch (error) {
      console.error("[Profile] Sign out error:", error);
    }
  };

  const stats = [
    { label: "Total KM", value: "156.4" },
    { label: "Activities", value: "47" },
    { label: "Streak", value: "12" },
    { label: "Badges", value: "8" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: Platform.OS === "ios" ? 100 : insets.bottom + Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <User size={40} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>Trailblazer</Text>
          <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
            Member since 2024
          </Text>
        </View>

        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            shadows.md,
          ]}
        >
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Pressable style={styles.menuItem} onPress={() => router.push("/(modals)/badge-detail")}>
            <View style={[styles.menuIcon, { backgroundColor: colors.accent + "20" }]}>
              <Award size={20} color={colors.accent} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Achievements</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <Pressable
            style={styles.menuItem}
            onPress={strava.isConnected ? strava.disconnect : strava.connect}
            disabled={strava.isLoading || strava.isSyncing}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#FC4C02" + "20" }]}>
              <Link2 size={20} color="#FC4C02" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                {strava.isConnected ? "Strava Connected" : "Connect Strava"}
              </Text>
              {strava.isConnected && strava.athleteUsername && (
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  @{strava.athleteUsername}
                </Text>
              )}
              {strava.error && (
                <Text style={{ fontSize: 12, color: colors.danger }}>{strava.error}</Text>
              )}
            </View>
            {strava.isLoading || strava.isSyncing ? (
              <ActivityIndicator size="small" color="#FC4C02" />
            ) : (
              <Text style={{ color: strava.isConnected ? colors.danger : colors.primary, fontWeight: "600" }}>
                {strava.isConnected ? "Disconnect" : "Connect"}
              </Text>
            )}
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.purple + "20" }]}>
              <Moon size={20} color={colors.purple} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{ false: colors.progressTrack, true: colors.primary + "60" }}
              thumbColor={isDark ? colors.primary : "#fff"}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <Pressable style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: colors.textSecondary + "20" }]}>
              <Settings size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Settings</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <Pressable style={styles.menuItem} onPress={handleSignOut}>
            <View style={[styles.menuIcon, { backgroundColor: colors.danger + "20" }]}>
              <LogOut size={20} color={colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.danger }]}>Sign Out</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.resetButton, { borderColor: colors.danger }]}
          onPress={() => router.push("/(modals)/reset-challenge")}
        >
          <Text style={[styles.resetButtonText, { color: colors.danger }]}>Reset Challenge</Text>
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
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  memberSince: {
    fontSize: 14,
  },
  statsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  resetButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
