# Apple Health Integration Plan

## Overview

Add Apple Health as an alternative activity sync source alongside Strava. Users choose ONE primary source to avoid data overlap and deduplication complexity.

## Background & Research

### The Overlap Problem

If both Strava and Apple Health are synced simultaneously:
- Same workout can appear twice (user records run on Apple Watch + Strava app)
- Strava often syncs TO Apple Health, creating circular data
- Deduplication logic is complex and error-prone

### Industry Best Practice

Apps like Athlytic, WHOOP, and TrainingPeaks have converged on:
- **One primary source for activities** (avoid duplicates)
- **Apple Health for passive metrics** (steps, heart rate) as supplementary data
- **Bridge apps** (RunGap, HealthFit) exist specifically because multi-source sync is hard

### Decision: Single Source Selection

For v1, implement Apple Health as a **mutually exclusive alternative** to Strava:

```
DATA SYNC
─────────────────────────────
○ None (manual logging only)
○ Strava
○ Apple Health        ← NEW
```

User picks ONE. This avoids:
- Deduplication complexity
- Sync conflicts
- Confusing UX

Future enhancement (v2): Add optional "Sync daily steps from Apple Health" toggle that supplements activity data.

---

## Apple Health Data Types

### Relevant for Trailblazer+

| HealthKit Type | Use Case |
|----------------|----------|
| `HKWorkoutType` | Structured activities (runs, hikes, cycles) |
| `HKQuantityType.stepCount` | Daily step count (passive) |
| `HKQuantityType.distanceWalkingRunning` | Distance from walking/running |
| `HKQuantityType.activeEnergyBurned` | Calories (optional) |

### Workout Types Mapping

| HealthKit Activity Type | App Type |
|-------------------------|----------|
| `.running` | run |
| `.hiking` | hike |
| `.cycling` | bike |
| `.walking` | walk |
| `.swimming` | swim |
| `.crossTraining`, `.functionalStrengthTraining` | workout |
| `.paddleSports`, `.rowing` | paddle |
| `.snowSports`, `.crossCountrySkiing`, `.downhillSkiing` | snow |
| (others) | other |

---

## Technical Implementation

### Dependencies

```bash
npx expo install expo-health-connect
# or
npx expo install react-native-health
```

**Note**: `expo-health-connect` is for Android (Google Health Connect). For iOS HealthKit, use `react-native-health` or native modules.

**Recommended**: Use `react-native-health` for iOS HealthKit:
```bash
npm install react-native-health
cd ios && pod install
```

### Permissions Required

Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "Trailblazer+ reads your workouts and step count to track your outdoor activities.",
        "NSHealthUpdateUsageDescription": "Trailblazer+ can save your logged activities to Apple Health."
      }
    }
  }
}
```

Add HealthKit entitlement (requires native build, not Expo Go).

---

## Architecture

### File Structure

```
lib/
├── health/
│   ├── index.ts              # Re-exports
│   ├── config.ts             # HealthKit permissions config
│   ├── hooks.ts              # useHealthConnection hook
│   └── sync.ts               # Activity sync logic
│
contexts/
└── health-context.tsx        # HealthKit authorization context
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User enables Apple Health in settings                        │
│    - App requests HealthKit authorization                       │
│    - User approves in iOS Health permissions sheet              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Initial Sync                                                 │
│    - Query HKWorkouts from last 30 days                         │
│    - Transform to ActivityDocument format                       │
│    - Store in Firestore: users/{uid}/activities                 │
│    - Update user stats                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Ongoing Sync (Background or Manual)                          │
│    - HealthKit observer query (if backgrounded)                 │
│    - OR manual pull when app opens / user taps refresh          │
│    - Check for new workouts since lastSyncAt                    │
│    - Dedupe by checking externalId (HKWorkout UUID)             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Difference from Strava

| Aspect | Strava | Apple Health |
|--------|--------|--------------|
| Auth | OAuth (server-side token exchange) | On-device HealthKit permission |
| Sync trigger | Webhooks (real-time push) | Observer queries or manual pull |
| Token storage | Firestore (encrypted) | None needed (on-device) |
| Data location | Strava servers → Cloud Function → Firestore | On-device → Direct to Firestore |

**Apple Health sync happens client-side** - no Cloud Functions needed for the sync itself.

---

## Implementation Steps

### Phase 1: Core Infrastructure

1. **Install dependencies**
   ```bash
   npm install react-native-health
   ```

2. **Create health module** (`lib/health/`)
   - `config.ts` - HealthKit permissions and type mappings
   - `sync.ts` - Query workouts, transform to app format

3. **Create HealthProvider** (`contexts/health-context.tsx`)
   - Request authorization
   - Track authorization status
   - Provide sync methods

4. **Create useHealthConnection hook** (`lib/health/hooks.ts`)
   - Mirror `useStravaConnection` API for consistency
   - `isConnected`, `connect`, `disconnect`, `sync`

### Phase 2: Database Updates

5. **Update ActivityDocument type**
   ```typescript
   source: "manual" | "strava" | "apple_health"
   ```

6. **Update user document**
   ```typescript
   healthConnection?: {
     isAuthorized: boolean;
     lastSyncAt: Timestamp | null;
   }
   ```

### Phase 3: UI Integration

7. **Update Profile/Settings screen**
   - Add Apple Health toggle
   - Make Strava and Apple Health mutually exclusive (radio buttons)
   - Show authorization status

8. **Update Home screen**
   - Sync button works for whichever source is connected
   - Activity badges show source ("S" for Strava, heart icon for Health)

### Phase 4: Polish

9. **Handle edge cases**
   - User switches from Strava to Apple Health (keep existing activities?)
   - Authorization denied/revoked
   - No workouts found

10. **Add to docs**
    - Update `docs/` with Apple Health integration guide
    - Update README

---

## API Design

### useHealthConnection Hook

```typescript
interface UseHealthConnectionReturn {
  // State
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;

  // Actions
  connect: () => Promise<void>;    // Request HealthKit auth
  disconnect: () => Promise<void>; // Clear local flag (can't revoke HealthKit)
  sync: () => Promise<number>;     // Sync workouts, return count
}

function useHealthConnection(uid: string | null): UseHealthConnectionReturn;
```

### Sync Function

```typescript
async function syncHealthWorkouts(
  uid: string,
  since?: Date  // Default: 30 days ago
): Promise<number> {
  // 1. Query HKWorkouts
  const workouts = await queryWorkouts(since);

  // 2. Transform each to ActivityDocument
  const activities = workouts.map(transformWorkout);

  // 3. Check for duplicates (by externalId = workout UUID)
  // 4. Store new ones in Firestore
  // 5. Update user stats
  // 6. Return count of new activities
}
```

---

## Mutual Exclusivity Logic

### When User Connects Apple Health

```typescript
async function connectHealth() {
  // 1. Check if Strava is connected
  if (user.stravaConnection) {
    // Show confirmation: "This will disconnect Strava. Continue?"
    // If confirmed, call stravaDisconnect first
  }

  // 2. Request HealthKit authorization
  // 3. Store healthConnection in user doc
  // 4. Initial sync
}
```

### Settings UI

```tsx
<RadioGroup value={activeSource} onChange={handleSourceChange}>
  <Radio value="none">Manual logging only</Radio>
  <Radio value="strava">Strava</Radio>
  <Radio value="apple_health">Apple Health</Radio>
</RadioGroup>
```

---

## Source Switching Strategy

When a user switches from one source to another (e.g., Apple Health → Strava), show a confirmation dialog with options:

### User Choice Dialog

```
┌─────────────────────────────────────────────────────────────┐
│ Switch to Strava?                                           │
│                                                             │
│ You have 10 activities synced from Apple Health.            │
│                                                             │
│ ○ Keep existing activities (recommended)                    │
│   Your Apple Health activities will remain. New activities  │
│   will sync from Strava.                                    │
│                                                             │
│ ○ Start fresh                                               │
│   Delete Apple Health activities and sync from Strava.      │
│                                                             │
│                              [Cancel]  [Switch to Strava]   │
└─────────────────────────────────────────────────────────────┘
```

### Why User Choice (Not Automatic)

- **No deduplication logic** - User decides, not algorithm
- **Data model unchanged** - Activities already have `source` field
- **Stats stay accurate** - Sum all activities regardless of source
- **Overlap is limited** - Only affects activities before switch date

### Database Operations

**If user chooses "Keep existing":**
```typescript
// 1. Disconnect old source
await stravaDisconnect(); // or clear healthConnection

// 2. Connect new source
await connectStrava(); // triggers initial sync

// 3. Stats: Already additive, no change needed
// All activities (apple_health + strava) count toward totals
```

**If user chooses "Start fresh":**
```typescript
// 1. Delete activities from old source
await deleteActivitiesBySource(uid, "apple_health");

// 2. Recalculate stats from remaining activities
await recalculateUserStats(uid);

// 3. Connect new source
await connectStrava();
```

### Helper Functions Needed

```typescript
// lib/db/activities.ts
async function deleteActivitiesBySource(
  uid: string,
  source: "manual" | "strava" | "apple_health"
): Promise<number> {
  const activitiesRef = collection(db, `users/${uid}/activities`);
  const q = query(activitiesRef, where("source", "==", source));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  return snapshot.size;
}

// lib/db/users.ts
async function recalculateUserStats(uid: string): Promise<void> {
  const activities = await getUserActivities(uid);

  const stats = activities.reduce((acc, activity) => ({
    totalKm: acc.totalKm + activity.distance,
    totalMinutes: acc.totalMinutes + Math.round(activity.duration / 60),
    totalSteps: acc.totalSteps + calculateSteps(activity.type, activity.distance),
  }), { totalKm: 0, totalMinutes: 0, totalSteps: 0 });

  await db.doc(`users/${uid}`).update({
    stats,
    updatedAt: serverTimestamp(),
  });
}
```

### Activity Count Query

To show "You have X activities from Apple Health" in the dialog:

```typescript
async function getActivityCountBySource(
  uid: string,
  source: "manual" | "strava" | "apple_health"
): Promise<number> {
  const activitiesRef = collection(db, `users/${uid}/activities`);
  const q = query(activitiesRef, where("source", "==", source));
  const snapshot = await getDocs(q);
  return snapshot.size;
}
```

---

## Platform Considerations

### iOS Only

Apple Health / HealthKit is iOS-only. For Android:
- Could integrate Google Fit / Health Connect in future
- For now, Android users use Strava or manual logging

### Expo Limitations

HealthKit requires native code:
- Won't work in Expo Go
- Requires development build (`npx expo run:ios`)
- Already using dev builds for Strava OAuth, so not a blocker

---

## Future Enhancements (v2)

### Supplementary Step Tracking

If user has Strava connected, optionally also sync Apple Health steps:

```
ACTIVITY SOURCE
● Strava

ADDITIONAL DATA
☑ Sync daily steps from Apple Health
  Captures passive walking not logged as workouts
```

This would:
- Query `HKQuantityType.stepCount` daily
- Add to user's totalSteps WITHOUT creating activity records
- Complement Strava activities rather than duplicate them

### Background Sync

- Use HealthKit observer queries to sync in background
- Show local notification when new workout synced
- Requires background modes capability

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `lib/health/index.ts` | CREATE - exports |
| `lib/health/config.ts` | CREATE - HealthKit config and type mappings |
| `lib/health/hooks.ts` | CREATE - useHealthConnection hook |
| `lib/health/sync.ts` | CREATE - sync logic (query + transform) |
| `lib/health/CLAUDE.md` | CREATE - module documentation |
| `contexts/health-context.tsx` | CREATE - HealthProvider |
| `lib/db/types.ts` | MODIFY - add `"apple_health"` to source union |
| `lib/db/activities.ts` | MODIFY - add `deleteActivitiesBySource()`, `getActivityCountBySource()` |
| `lib/db/users.ts` | MODIFY - add `recalculateUserStats()` |
| `app/_layout.tsx` | MODIFY - add HealthProvider to provider hierarchy |
| `app/(tabs)/profile.tsx` | MODIFY - add Health toggle, source switching dialog |
| `app.json` | MODIFY - add HealthKit entitlements and usage descriptions |
| `docs/apple-health-integration.md` | CREATE - user-facing documentation |

---

## Estimated Effort

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Core infrastructure | Medium |
| Phase 2 | Database updates | Small |
| Phase 3 | UI integration | Medium |
| Phase 4 | Polish & docs | Small |

**Total**: Medium complexity, similar scope to Strava integration but simpler (no OAuth, no webhooks, client-side only).

---

## Decisions Made

| Question | Decision |
|----------|----------|
| **When switching sources** | User chooses: "Keep existing" (recommended) or "Start fresh" |
| **Write back to Apple Health** | NO for v1 - read only, don't write manual activities to HealthKit |
| **Android (Google Health Connect)** | Separate task - implement in a different PR |

### Rationale

1. **Source switching with user choice**: Avoids complex deduplication, puts control in user's hands, limited overlap window
2. **No write-back for v1**: Simplifies implementation, avoids bidirectional sync complexity, can add later if users request
3. **Android separate**: Different APIs (Health Connect vs HealthKit), cleaner PRs, can ship iOS first
