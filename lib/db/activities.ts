import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, querySnapshotToArray, timestampToDate } from "./utils";
import {
  LogActivityInput,
  Activity,
  ActivityDocument,
  QueryOptions,
} from "./types";
import { incrementUserStats, updateStreak } from "./users";

// Calculate steps from distance (1300 steps per km)
function calculateSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1300);
}

// Log new activity (creates activity + updates user stats)
export async function logActivity(
  uid: string,
  input: LogActivityInput
): Promise<string> {
  // Add activity document
  const activitiesRef = collection(db, collections.activities(uid));
  const docRef = await addDoc(activitiesRef, {
    source: "manual",
    externalId: null,
    type: input.type,
    duration: input.duration,
    distance: input.distance,
    location: input.location,
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  // Update user stats atomically
  // Only count steps for walking, hiking, and running activities
  const stepsActivities = ["walk", "hike", "run"];
  const steps = stepsActivities.includes(input.type)
    ? calculateSteps(input.distance)
    : 0;

  await incrementUserStats(uid, {
    km: input.distance,
    minutes: input.duration,
    steps: steps,
  });

  // Update streak
  await updateStreak(uid);

  return docRef.id;
}

// Get user activities with options
export async function getUserActivities(
  uid: string,
  options: QueryOptions = {}
): Promise<Activity[]> {
  const activitiesRef = collection(db, collections.activities(uid));

  let q = query(activitiesRef);

  // Apply ordering
  const order = options.orderByDate || "desc";
  q = query(q, orderBy("date", order));

  // Apply limit
  if (options.limit) {
    q = query(q, firestoreLimit(options.limit));
  }

  const snapshot = await getDocs(q);
  const activities = querySnapshotToArray<ActivityDocument>(snapshot.docs);

  // Convert Timestamps to Dates
  return activities.map((activity) => ({
    id: activity.id,
    source: activity.source || "manual",
    externalId: activity.externalId || null,
    type: activity.type,
    duration: activity.duration,
    distance: activity.distance,
    location: activity.location,
    date: timestampToDate(activity.date),
    elapsedTime: activity.elapsedTime,
    elevationGain: activity.elevationGain,
    name: activity.name,
    sportType: activity.sportType,
  }));
}

// Get recent activities (shorthand)
export async function getRecentActivities(
  uid: string,
  limit: number = 3
): Promise<Activity[]> {
  return getUserActivities(uid, { limit, orderByDate: "desc" });
}

// Get start of current week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get count of activities logged this week
export async function getWeeklyActivityCount(uid: string): Promise<number> {
  const activities = await getUserActivities(uid);
  const startOfWeek = getStartOfWeek(new Date());

  return activities.filter((activity) => activity.date >= startOfWeek).length;
}

// Check if user is eligible for weekly giveaway (3+ activities this week)
export async function isEligibleForGiveaway(uid: string): Promise<boolean> {
  const count = await getWeeklyActivityCount(uid);
  return count >= 3;
}
