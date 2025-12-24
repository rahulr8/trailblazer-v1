import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDocData, collections } from "./utils";
import { UserDocument, CreateUserInput, UserStats, StatDeltas } from "./types";

// Create new user document
export async function createUser(
  uid: string,
  input: CreateUserInput
): Promise<void> {
  const userRef = doc(db, collections.users, uid);

  await setDoc(userRef, {
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL,
    membershipTier: "free",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: {
      totalKm: 0,
      totalMinutes: 0,
      totalSteps: 0,
      currentStreak: 0,
    },
  });
}

// Get user document
export async function getUser(uid: string): Promise<UserDocument | null> {
  const userRef = doc(db, collections.users, uid);
  const snapshot = await getDoc(userRef);
  return getDocData<UserDocument>(snapshot);
}

// Check if user exists
export async function userExists(uid: string): Promise<boolean> {
  const userRef = doc(db, collections.users, uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists();
}

// Get user stats only
export async function getUserStats(uid: string): Promise<UserStats | null> {
  const user = await getUser(uid);
  return user?.stats || null;
}

// Update user stats with increments
export async function incrementUserStats(
  uid: string,
  deltas: StatDeltas
): Promise<void> {
  const userRef = doc(db, collections.users, uid);

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (deltas.km !== undefined) {
    updates["stats.totalKm"] = increment(deltas.km);
  }
  if (deltas.minutes !== undefined) {
    updates["stats.totalMinutes"] = increment(deltas.minutes);
  }
  if (deltas.steps !== undefined) {
    updates["stats.totalSteps"] = increment(deltas.steps);
  }

  await updateDoc(userRef, updates);
}

// Helper to get start of day (midnight) for a date
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper to check if two dates are consecutive days
function areConsecutiveDays(earlier: Date, later: Date): boolean {
  const earlierStart = getStartOfDay(earlier);
  const laterStart = getStartOfDay(later);
  const diffMs = laterStart.getTime() - earlierStart.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

// Helper to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Update streak when logging an activity
export async function updateStreak(uid: string): Promise<void> {
  const userRef = doc(db, collections.users, uid);
  const user = await getUser(uid);

  if (!user) return;

  const today = new Date();
  const lastActivityDate = user.lastActivityDate?.toDate();
  const currentStreak = user.stats.currentStreak;

  let newStreak: number;

  if (!lastActivityDate) {
    // First activity ever - start streak at 1
    newStreak = 1;
  } else if (isSameDay(lastActivityDate, today)) {
    // Already logged today - no change to streak
    newStreak = currentStreak;
  } else if (areConsecutiveDays(lastActivityDate, today)) {
    // Consecutive day - increment streak
    newStreak = currentStreak + 1;
  } else {
    // Gap in days - reset streak to 1
    newStreak = 1;
  }

  await updateDoc(userRef, {
    "stats.currentStreak": newStreak,
    lastActivityDate: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Recalculate streak from activity history (for fixing existing data)
export async function recalculateStreak(
  uid: string,
  activities: { date: Date }[]
): Promise<number> {
  if (activities.length === 0) return 0;

  const userRef = doc(db, collections.users, uid);
  const today = getStartOfDay(new Date());

  // Get unique days with activities, sorted descending (most recent first)
  const uniqueDays = [...new Set(
    activities.map((a) => getStartOfDay(a.date).getTime())
  )].sort((a, b) => b - a);

  // Check if most recent activity is today or yesterday
  const mostRecentDay = new Date(uniqueDays[0]);
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - mostRecentDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If last activity was more than 1 day ago, streak is broken
  if (daysSinceLastActivity > 1) {
    await updateDoc(userRef, {
      "stats.currentStreak": 0,
      updatedAt: serverTimestamp(),
    });
    return 0;
  }

  // Count consecutive days going backwards
  let streak = 0;
  let expectedDay = daysSinceLastActivity === 0 ? today : mostRecentDay;

  for (const dayTimestamp of uniqueDays) {
    const activityDay = new Date(dayTimestamp);

    if (isSameDay(activityDay, expectedDay)) {
      streak++;
      // Move to previous day
      expectedDay = new Date(expectedDay);
      expectedDay.setDate(expectedDay.getDate() - 1);
    } else if (activityDay < expectedDay) {
      // Gap found, streak ends
      break;
    }
  }

  // Update the streak in the database
  await updateDoc(userRef, {
    "stats.currentStreak": streak,
    lastActivityDate: activities.length > 0
      ? activities.reduce((latest, a) => a.date > latest ? a.date : latest, activities[0].date)
      : null,
    updatedAt: serverTimestamp(),
  });

  return streak;
}

// Update membership tier
export async function updateMembershipTier(
  uid: string,
  tier: "free" | "platinum"
): Promise<void> {
  const userRef = doc(db, collections.users, uid);
  await updateDoc(userRef, {
    membershipTier: tier,
    updatedAt: serverTimestamp(),
  });
}

// Upgrade user to Platinum (convenience function)
export async function upgradeToPlatinum(uid: string): Promise<void> {
  const userRef = doc(db, collections.users, uid);
  await updateDoc(userRef, {
    membershipTier: "platinum",
    upgradedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Reset user challenge (clear all stats and delete all activities)
export async function resetUserChallenge(uid: string): Promise<void> {
  // Reset stats to zero and downgrade to free tier
  const userRef = doc(db, collections.users, uid);
  await updateDoc(userRef, {
    "stats.totalKm": 0,
    "stats.totalMinutes": 0,
    "stats.totalSteps": 0,
    "stats.currentStreak": 0,
    membershipTier: "free",
    updatedAt: serverTimestamp(),
  });

  // Delete all activities
  const activitiesRef = collection(db, collections.activities(uid));
  const snapshot = await getDocs(activitiesRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete all saved adventures
  const savedRef = collection(db, collections.savedAdventures(uid));
  const savedSnapshot = await getDocs(savedRef);

  const deleteSavedPromises = savedSnapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );
  await Promise.all(deleteSavedPromises);
}
