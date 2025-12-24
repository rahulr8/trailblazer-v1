import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

import { fetchActivities, fetchActivity } from "./api";
import { ActivityDoc, StravaActivity } from "./types";

const db = getFirestore();

const STRAVA_TYPE_MAP: Record<string, string> = {
  Run: "run",
  TrailRun: "run",
  VirtualRun: "run",
  Ride: "bike",
  MountainBikeRide: "bike",
  GravelRide: "bike",
  VirtualRide: "bike",
  EBikeRide: "bike",
  Hike: "hike",
  Walk: "walk",
  Swim: "swim",
  Workout: "workout",
  WeightTraining: "workout",
  Yoga: "workout",
  Kayaking: "paddle",
  Canoeing: "paddle",
  StandUpPaddling: "paddle",
  NordicSki: "snow",
  BackcountrySki: "snow",
  Snowshoe: "snow",
  AlpineSki: "snow",
  Snowboard: "snow",
};

function mapStravaType(stravaType: string): string {
  return STRAVA_TYPE_MAP[stravaType] || "other";
}

function transformActivity(stravaActivity: StravaActivity): ActivityDoc {
  return {
    source: "strava",
    externalId: stravaActivity.id.toString(),
    type: mapStravaType(stravaActivity.type),
    duration: stravaActivity.moving_time,
    distance: stravaActivity.distance / 1000,
    location: stravaActivity.location_city || null,
    date: Timestamp.fromDate(new Date(stravaActivity.start_date)),
    createdAt: FieldValue.serverTimestamp(),
    elapsedTime: stravaActivity.elapsed_time,
    elevationGain: stravaActivity.total_elevation_gain,
    name: stravaActivity.name,
    sportType: stravaActivity.sport_type,
  };
}

const STEPS_PER_KM = 1300;
const STEPS_ACTIVITIES = ["run", "hike", "walk"];

function calculateSteps(type: string, distanceKm: number): number {
  if (STEPS_ACTIVITIES.includes(type)) {
    return Math.round(distanceKm * STEPS_PER_KM);
  }
  return 0;
}

async function updateUserStats(
  uid: string,
  distanceKm: number,
  durationMinutes: number,
  steps: number
): Promise<void> {
  await db.doc(`users/${uid}`).update({
    "stats.totalKm": FieldValue.increment(distanceKm),
    "stats.totalMinutes": FieldValue.increment(durationMinutes),
    "stats.totalSteps": FieldValue.increment(steps),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function syncRecentActivities(uid: string, accessToken: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const afterTimestamp = Math.floor(thirtyDaysAgo.getTime() / 1000);

  let syncedCount = 0;
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await fetchActivities(accessToken, {
      after: afterTimestamp,
      per_page: 100,
      page,
    });

    for (const stravaActivity of activities) {
      const synced = await syncSingleActivity(uid, stravaActivity);
      if (synced) syncedCount++;
    }

    hasMore = activities.length === 100;
    page++;

    if (page > 10) {
      console.warn(`Pagination limit reached for user ${uid}`);
      break;
    }
  }

  console.log(`Synced ${syncedCount} activities for user ${uid}`);
  return syncedCount;
}

async function syncSingleActivity(uid: string, stravaActivity: StravaActivity): Promise<boolean> {
  const activitiesRef = db.collection(`users/${uid}/activities`);
  const externalId = stravaActivity.id.toString();

  const existing = await activitiesRef.where("externalId", "==", externalId).limit(1).get();

  if (!existing.empty) {
    return false;
  }

  const activityDoc = transformActivity(stravaActivity);

  await activitiesRef.add(activityDoc);

  const durationMinutes = Math.round(stravaActivity.moving_time / 60);
  const distanceKm = stravaActivity.distance / 1000;
  const steps = calculateSteps(activityDoc.type, distanceKm);

  await updateUserStats(uid, distanceKm, durationMinutes, steps);

  return true;
}

export async function syncActivityById(
  uid: string,
  accessToken: string,
  activityId: number
): Promise<boolean> {
  const stravaActivity = await fetchActivity(accessToken, activityId);
  return syncSingleActivity(uid, stravaActivity);
}

export async function deleteActivityByExternalId(
  uid: string,
  externalId: string
): Promise<boolean> {
  const activitiesRef = db.collection(`users/${uid}/activities`);

  const existing = await activitiesRef.where("externalId", "==", externalId).limit(1).get();

  if (existing.empty) {
    return false;
  }

  const activityDoc = existing.docs[0];
  const activityData = activityDoc.data() as ActivityDoc;

  const durationMinutes = Math.round(activityData.duration / 60);
  const distanceKm = activityData.distance;
  const steps = calculateSteps(activityData.type, distanceKm);

  await db.doc(`users/${uid}`).update({
    "stats.totalKm": FieldValue.increment(-distanceKm),
    "stats.totalMinutes": FieldValue.increment(-durationMinutes),
    "stats.totalSteps": FieldValue.increment(-steps),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await activityDoc.ref.delete();

  return true;
}

export async function updateActivityByExternalId(
  uid: string,
  accessToken: string,
  activityId: number
): Promise<boolean> {
  const stravaActivity = await fetchActivity(accessToken, activityId);
  const externalId = activityId.toString();

  const activitiesRef = db.collection(`users/${uid}/activities`);

  const existing = await activitiesRef.where("externalId", "==", externalId).limit(1).get();

  if (existing.empty) {
    return syncSingleActivity(uid, stravaActivity);
  }

  const activityDoc = existing.docs[0];

  await activityDoc.ref.update({
    name: stravaActivity.name,
    type: mapStravaType(stravaActivity.type),
    sportType: stravaActivity.sport_type,
  });

  return true;
}
