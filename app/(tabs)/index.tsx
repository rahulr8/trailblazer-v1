import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";

import { Button } from "heroui-native";

import { Activity as ActivityIcon, Plus, RefreshCw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Spacing } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { auth } from "@/lib/firebase";
import { getUserStats } from "@/lib/db/users";
import { getRecentActivities } from "@/lib/db/activities";
import { Activity, UserStats } from "@/lib/db/types";
import { useStravaConnection } from "@/lib/strava";

function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (activityDate.getTime() === today.getTime()) return "Today";
  if (activityDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function HomeScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [uid, setUid] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const strava = useStravaConnection(uid);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
  }, []);

  const fetchData = async () => {
    if (!uid) return;
    try {
      const [userStats, recentActivities] = await Promise.all([
        getUserStats(uid),
        getRecentActivities(uid, 5),
      ]);
      setStats(userStats);
      setActivities(recentActivities);
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    fetchData().finally(() => setLoading(false));
  }, [uid]);

  const handleSync = async () => {
    await strava.sync();
    await fetchData();
  };

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
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: "45%" }]} />
          </View>

          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Day 27 of 60 • 45% complete
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button onPress={() => router.push("/(modals)/log-activity")}>
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
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats?.totalKm.toFixed(1) ?? "0"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {stats?.totalSteps.toLocaleString() ?? "0"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.highlight }]}>
                {stats?.currentStreak ?? "0"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>day streak</Text>
            </View>
          </View>
        </View>

        {activities.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
              shadows.md,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Activities</Text>
              {strava.isConnected && (
                <Pressable
                  onPress={handleSync}
                  disabled={strava.isSyncing}
                  style={[styles.syncButton, { opacity: strava.isSyncing ? 0.5 : 1 }]}
                >
                  <RefreshCw
                    size={18}
                    color="#FC4C02"
                    style={strava.isSyncing ? { transform: [{ rotate: "45deg" }] } : undefined}
                  />
                </Pressable>
              )}
            </View>
            <View style={styles.activitiesList}>
              {activities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.primary + "20" }]}>
                    <ActivityIcon size={16} color={colors.primary} />
                  </View>
                  <View style={styles.activityInfo}>
                    <View style={styles.activityHeader}>
                      <Text style={[styles.activityName, { color: colors.textPrimary }]}>
                        {activity.name || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Text>
                      {activity.source === "strava" && (
                        <View style={[styles.stravaBadge, { backgroundColor: "#FC4C02" }]}>
                          <Text style={styles.stravaBadgeText}>S</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.activityDetails, { color: colors.textSecondary }]}>
                      {activity.distance.toFixed(1)} km • {formatDuration(Math.round(activity.duration / 60))} • {formatDate(activity.date)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activities.length === 0 && !loading && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
              shadows.md,
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Recent Activities</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              No activities yet. Log your first activity or connect Strava to sync!
            </Text>
          </View>
        )}

        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            shadows.md,
          ]}
          onPress={() => router.push("/chat")}
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
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: -4,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  syncButton: {
    padding: Spacing.xs,
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
    height: "100%",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  activitiesList: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "600",
  },
  activityDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  stravaBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  stravaBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
