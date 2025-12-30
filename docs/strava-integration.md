# Strava Integration

Complete guide to how Strava OAuth and activity sync works in Trailblazer+.

## Cloud Functions

| Function | Type | Purpose |
|----------|------|---------|
| `stravaTokenExchange` | HTTPS Callable | Exchange OAuth code for tokens, store encrypted, initial sync |
| `stravaDisconnect` | HTTPS Callable | Revoke tokens at Strava, delete connection from Firestore |
| `stravaSync` | HTTPS Callable | Manual sync - fetch recent activities on demand |
| `stravaWebhook` | HTTPS Request | Receive webhook events from Strava |
| `processStravaWebhook` | Firestore Trigger | Process queued webhook events asynchronously |

---

## OAuth Flow

### Step 1: User Initiates Connection

**File:** `contexts/strava-context.tsx`

When user taps "Connect Strava":
1. App builds OAuth URL with `client_id`, `redirect_uri`, `scopes`
2. Opens in-app browser via `WebBrowser.openAuthSessionAsync()`

```
https://www.strava.com/oauth/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=trailblazerplus://trailblazerplus
  &response_type=code
  &scope=activity:read
```

### Step 2: User Authorizes in Strava

- User sees Strava authorization page
- User taps "Authorize"
- Strava redirects back to app: `trailblazerplus://?code=AUTHORIZATION_CODE`

### Step 3: App Receives Code

**File:** `contexts/strava-context.tsx`

- `WebBrowser.openAuthSessionAsync()` returns with `result.url`
- App extracts authorization code from URL query params
- Calls Cloud Function: `stravaTokenExchange({ code, scopes })`

### Step 4: Token Exchange (Cloud Function)

**File:** `functions/src/strava/auth.ts` → `stravaTokenExchange`

```
┌─────────────────────────────────────────────────────────────┐
│ stravaTokenExchange                                         │
│                                                             │
│ 1. Exchange code for tokens                                 │
│    POST https://www.strava.com/oauth/token                  │
│    Body: { client_id, client_secret, code, grant_type }     │
│    Response: { access_token, refresh_token, expires_at,     │
│               athlete: { id, username, firstname, ... } }   │
│                                                             │
│ 2. Encrypt tokens with AES-256-GCM                          │
│                                                             │
│ 3. Store in Firestore: users/{uid}.stravaConnection         │
│    {                                                        │
│      athleteId: 12345,                                      │
│      athleteUsername: "runner123",                          │
│      accessToken: "encrypted...",                           │
│      refreshToken: "encrypted...",                          │
│      tokenExpiresAt: <6 hours from now>,                    │
│      scopes: ["activity:read"],                             │
│      connectedAt: <timestamp>                               │
│    }                                                        │
│                                                             │
│ 4. Initial sync: syncRecentActivities()                     │
│    - Fetches last 30 days of activities                     │
│    - Stores each in users/{uid}/activities                  │
│    - Updates user stats (km, minutes, steps)                │
│                                                             │
│ 5. Return { success: true, athleteId, athleteName }         │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: UI Updates

**File:** `lib/strava/hooks.ts` → `useStravaConnection`

- Firestore `onSnapshot` listener detects `stravaConnection` field added
- Updates hook state: `isConnected = true`, `athleteUsername`, etc.
- UI shows "Connected to Strava"

---

## Ongoing Activity Sync (Webhooks)

When user logs an activity on Strava, it automatically syncs to the app.

### Webhook Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. STRAVA sends webhook POST                                             │
│    URL: https://us-central1-PROJECT.cloudfunctions.net/stravaWebhook     │
│                                                                          │
│    Body: {                                                               │
│      object_type: "activity",                                            │
│      object_id: 123456789,      // Strava activity ID                    │
│      aspect_type: "create",     // or "update" or "delete"               │
│      owner_id: 12345,           // Strava athlete ID                     │
│      event_time: 1703875200                                              │
│    }                                                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 2. stravaWebhook (HTTPS Request handler)                                 │
│    File: functions/src/strava/webhook.ts                                 │
│                                                                          │
│    - Validates it's an activity event (ignores athlete events)           │
│    - Looks up Firebase UID by athleteId (findUserByAthleteId)            │
│    - If user found → queue event in stravaWebhookQueue collection        │
│    - If unknown athlete → ignore (returns 200 OK anyway)                 │
│    - Returns 200 OK immediately (Strava requires <2s response)           │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 3. processStravaWebhook (Firestore Trigger)                              │
│    Triggered when document created in stravaWebhookQueue                 │
│                                                                          │
│    - Gets valid access token (auto-refreshes if expired)                 │
│    - Based on aspect_type:                                               │
│        "create" → syncActivityById() - fetch & store new activity        │
│        "update" → updateActivityByExternalId() - update metadata         │
│        "delete" → deleteActivityByExternalId() - remove & adjust stats   │
│    - Marks webhook document as processed                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 4. App UI Updates                                                        │
│                                                                          │
│    - Firestore listener sees new activity in users/{uid}/activities      │
│    - Home screen refreshes, shows new activity with Strava badge         │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why Queue + Trigger?

Strava requires webhook responses within 2 seconds. By immediately queuing the event and processing it asynchronously via Firestore trigger, we:
- Always respond quickly to Strava
- Can retry failed processing
- Have an audit trail of all events

---

## Token Management

### Token Expiration

Strava access tokens expire in **6 hours**. The app handles this automatically.

### Auto-Refresh Logic

**File:** `functions/src/strava/auth.ts` → `getValidAccessToken()`

```typescript
async function getValidAccessToken(uid: string): Promise<string> {
  // 1. Get stored connection from Firestore
  const connection = userData.stravaConnection;

  // 2. Check if token is still valid (with 1 minute buffer)
  if (tokenExpiresAt > now + 60000) {
    return decrypt(connection.accessToken);
  }

  // 3. Token expired - refresh it
  const newTokens = await refreshAccessToken(connection.refreshToken);

  // 4. Store new encrypted tokens in Firestore
  await updateFirestore(newTokens);

  // 5. Return fresh access token
  return newTokens.access_token;
}
```

**Important:** When Strava issues a new refresh token, the old one is invalidated. Always persist the latest tokens.

---

## Manual Sync

Users can manually trigger a sync from the home screen (refresh button).

**File:** `functions/src/strava/auth.ts` → `stravaSync`

1. App calls `stravaSync` Cloud Function
2. Function gets valid access token (auto-refreshes if needed)
3. Calls `syncRecentActivities()` - fetches last 30 days
4. Skips duplicates (checks `externalId`)
5. Returns count of newly synced activities

---

## Disconnect Flow

**File:** `functions/src/strava/auth.ts` → `stravaDisconnect`

1. Decrypt stored access token
2. Call Strava API to revoke: `POST /oauth/deauthorize`
3. Delete `stravaConnection` field from user document
4. User's synced activities remain in Firestore

---

## Security

### Token Storage
- Tokens encrypted with AES-256-GCM before Firestore storage
- Encryption key stored in Cloud Functions environment (never in app)
- Client secret only exists server-side

### Webhook Validation
- Strava doesn't sign webhook payloads
- We validate by checking if `owner_id` (athlete) exists in our database
- Unknown athletes are silently ignored (prevents abuse)

### Firestore Security Rules
- Only the user can read their own `stravaConnection`
- `stravaWebhookQueue` is server-only (Cloud Functions)

---

## Data Model

### stravaConnection (on UserDocument)

```typescript
{
  athleteId: number;           // Strava athlete ID (indexed)
  athleteUsername: string;     // Display name
  accessToken: string;         // Encrypted
  refreshToken: string;        // Encrypted
  tokenExpiresAt: Timestamp;   // When access token expires
  scopes: string[];            // Authorized scopes
  connectedAt: Timestamp;      // When user connected
  lastSyncAt: Timestamp | null; // Last successful sync
}
```

### ActivityDocument (from Strava)

```typescript
{
  source: "strava";            // Identifies Strava activities
  externalId: string;          // Strava activity ID (for deduplication)
  type: string;                // Mapped type (run, hike, bike, etc.)
  duration: number;            // Moving time in seconds
  distance: number;            // Kilometers
  location: string | null;     // City name
  date: Timestamp;             // Activity start time
  name: string;                // Activity title from Strava
  elevationGain?: number;      // Meters
  sportType?: string;          // Original Strava sport type
}
```

---

## Strava Type Mapping

| Strava Type | App Type |
|-------------|----------|
| Run, TrailRun, VirtualRun | run |
| Ride, MountainBikeRide, GravelRide, VirtualRide, EBikeRide | bike |
| Hike | hike |
| Walk | walk |
| Swim | swim |
| Workout, WeightTraining, Yoga | workout |
| Kayaking, Canoeing, StandUpPaddling | paddle |
| NordicSki, BackcountrySki, Snowshoe, AlpineSki, Snowboard | snow |
| (others) | other |

---

## Webhook Registration

After deploying Cloud Functions, register the webhook subscription once:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://REGION-PROJECT.cloudfunctions.net/stravaWebhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

The `stravaWebhook` function handles the validation challenge (GET request) automatically.

---

## Rate Limits

Strava API limits: **200 requests/15 min**, **2000 requests/day**

- Initial sync: 1-10 requests (paginated, 100 activities per page)
- Per webhook: 1 request
- Manual sync: 1-10 requests

The app stays well within limits for normal usage.
