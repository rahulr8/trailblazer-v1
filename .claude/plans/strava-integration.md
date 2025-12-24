# Strava Integration Plan for Trailblazer+

## Overview

Integrate Strava OAuth and activity syncing using Firebase Cloud Functions as the backend. Sync essential activity data (distance, duration, elevation, type, date) from the last 30 days on initial connect, then use webhooks for real-time updates.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Native   │────▶│ Cloud Functions │────▶│    Firestore    │
│  (Expo)         │     │  (Backend)      │     │    (Database)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  expo-auth-     │     │   Strava API    │
│  session        │     │                 │
└─────────────────┘     └─────────────────┘
```

---

## Implementation Status

### Completed
- [x] Cloud Functions structure (`functions/src/strava/`)
- [x] Token exchange and refresh logic (`auth.ts`)
- [x] Activity sync and transformation (`sync.ts`)
- [x] Webhook handler and processor (`webhook.ts`)
- [x] Firestore types extended (`lib/db/types.ts`)
- [x] React Native auth module (`lib/strava/`)
- [x] Expo dependencies installed

### Pending Fixes (from code review)
- [ ] Add Firestore index for athlete ID lookup
- [ ] Add pagination to initial sync
- [ ] Add early webhook validation for unknown athletes
- [ ] Fix encryption key documentation (64 hex chars, not 32)

---

## Pending Fix #1: Firestore Index

**Problem**: `findUserByAthleteId()` queries `stravaConnection.athleteId` but without an index, this query will fail or be slow.

**File to create**: `firestore.indexes.json`

```json
{
  "indexes": [],
  "fieldOverrides": [
    {
      "collectionGroup": "users",
      "fieldPath": "stravaConnection.athleteId",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" }
      ]
    }
  ]
}
```

**Deploy with**: `firebase deploy --only firestore:indexes`

---

## Pending Fix #2: Initial Sync Pagination

**Problem**: Current code fetches `per_page: 100` but doesn't handle users with 100+ activities in 30 days.

**File**: `functions/src/strava/sync.ts`

**Current code** (line 77-98):
```typescript
export async function syncRecentActivities(
  uid: string,
  accessToken: string
): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activities = await fetchActivities(accessToken, {
    after: Math.floor(thirtyDaysAgo.getTime() / 1000),
    per_page: 100,
  });
  // ... only syncs first 100
}
```

**Fixed code**:
```typescript
export async function syncRecentActivities(
  uid: string,
  accessToken: string
): Promise<number> {
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

    // Safety limit to prevent runaway loops
    if (page > 10) {
      console.warn(`Pagination limit reached for user ${uid}`);
      break;
    }
  }

  console.log(`Synced ${syncedCount} activities for user ${uid}`);
  return syncedCount;
}
```

---

## Pending Fix #3: Early Webhook Validation

**Problem**: Strava doesn't sign webhook payloads. Anyone who discovers the endpoint URL can POST fake events. Current code queues everything, then fails later when athlete not found.

**File**: `functions/src/strava/webhook.ts`

**Current code** (line 38-68):
```typescript
if (req.method === "POST") {
  // ... queues everything immediately
  await db.collection("stravaWebhookQueue").add(queueDoc);
  res.status(200).send("OK");
}
```

**Fixed code** - validate athlete exists before queuing:
```typescript
if (req.method === "POST") {
  const event = req.body as StravaWebhookEvent;

  console.log("Strava webhook received:", JSON.stringify(event));

  // Ignore non-activity events
  if (event.object_type !== "activity") {
    if (
      event.object_type === "athlete" &&
      event.aspect_type === "update" &&
      event.updates?.["authorized"] === "false"
    ) {
      console.log(`Athlete ${event.owner_id} deauthorized app`);
    }
    res.status(200).send("OK");
    return;
  }

  // Early validation: drop events for unknown athletes
  // This reduces processing and mitigates fake webhook attacks
  const uid = await findUserByAthleteId(event.owner_id);
  if (!uid) {
    console.log(`Ignoring webhook for unknown athlete ${event.owner_id}`);
    res.status(200).send("OK");
    return;
  }

  const queueDoc: WebhookQueueDoc = {
    objectType: event.object_type,
    objectId: event.object_id,
    aspectType: event.aspect_type,
    ownerId: event.owner_id,
    eventTime: event.event_time,
    receivedAt: FieldValue.serverTimestamp(),
    processedAt: null,
  };

  await db.collection("stravaWebhookQueue").add(queueDoc);
  res.status(200).send("OK");
}
```

**Trade-off**: This adds a Firestore read to every webhook request, but:
- Drops fake/invalid events immediately
- Reduces queue writes for non-existent users
- Still responds within 2-second requirement

---

## Pending Fix #4: Encryption Key Documentation

**Problem**: 32 bytes = 64 hex characters. Current `.env.example` is misleading.

**File**: `functions/.env.example`

**Current**:
```
ENCRYPTION_KEY=32_byte_hex_string_for_token_encryption
```

**Fixed**:
```
# AES-256 requires 32 bytes = 64 hex characters
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string_here
```

---

## Security Notes (from review)

### Token Encryption Reality Check
The encryption protects against:
- Attackers with Firestore read access but not Cloud Functions access
- Accidental token exposure in logs/backups

It does NOT protect against:
- Full Cloud Functions compromise (they can just read ENCRYPTION_KEY)
- This is acceptable for activity stats; overkill defenses (Cloud KMS) not needed

### Webhook Security
Strava doesn't sign payloads (unlike Stripe). Mitigations:
1. Early athlete validation (Fix #3) drops unknown owner_ids
2. verify_token only protects subscription creation, not ongoing POSTs
3. Low risk: attacker would need valid owner_id that exists in our system

---

## Files to Modify

| File | Change |
|------|--------|
| `functions/src/strava/sync.ts` | Add pagination loop |
| `functions/src/strava/webhook.ts` | Add early athlete validation |
| `functions/.env.example` | Fix encryption key comment |
| `firestore.indexes.json` | Create with athleteId index |

---

## Environment Variables

### Cloud Functions (`.env`)

```bash
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_VERIFY_TOKEN=any_random_string_you_choose

# AES-256 requires 32 bytes = 64 hex characters
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string
```

### React Native

```
EXPO_PUBLIC_STRAVA_CLIENT_ID=your_client_id
```

---

## Remaining Setup Steps

1. **Create Strava App**: https://www.strava.com/settings/api
   - Set Authorization Callback Domain to `trailblazerplus`

2. **Configure Environment**: Create `functions/.env` with credentials

3. **Deploy Functions**:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

4. **Deploy Index**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

5. **Register Webhook** (after deploy):
   ```bash
   curl -X POST https://www.strava.com/api/v3/push_subscriptions \
     -F client_id=YOUR_CLIENT_ID \
     -F client_secret=YOUR_CLIENT_SECRET \
     -F callback_url=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stravaWebhook \
     -F verify_token=YOUR_VERIFY_TOKEN
   ```

6. **Build UI Components**: Create connect/disconnect button using `useStravaConnection` hook

---

## Rate Limits

| Limit | Value |
|-------|-------|
| Requests per 15 min | 200 |
| Requests per day | 2,000 |
| Initial sync (30 days, paginated) | 1-10 requests/user |
| Per activity (webhook) | 1 request |
