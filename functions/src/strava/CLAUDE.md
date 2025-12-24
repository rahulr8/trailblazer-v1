# Strava Cloud Functions (`functions/src/strava/`)

Server-side Strava API integration handling OAuth, webhooks, and activity sync.

## Structure

```
functions/src/strava/
├── types.ts      # Strava API and Firestore types
├── api.ts        # Strava API client (fetch wrapper)
├── auth.ts       # Token exchange, refresh, user lookup
├── sync.ts       # Activity sync and transformation
└── webhook.ts    # Webhook handler and processor
```

## Files

### types.ts
TypeScript interfaces for:
- `StravaTokenResponse` - OAuth token exchange response
- `StravaAthlete` - Athlete profile data
- `StravaActivity` - Activity from Strava API
- `StravaWebhookEvent` - Webhook POST payload
- `StravaConnectionDoc` - Firestore storage format
- `WebhookQueueDoc` - Webhook queue document
- `ActivityDoc` - Activity storage format

### api.ts
Strava API client functions:
- `exchangeCodeForTokens(code)` - OAuth code → tokens
- `refreshAccessToken(refreshToken)` - Refresh expired tokens
- `revokeAccessToken(accessToken)` - Deauthorize
- `fetchActivities(token, options)` - List athlete activities
- `fetchActivity(token, activityId)` - Get single activity

### auth.ts
Exported Cloud Functions:
- `stravaTokenExchange` - HTTPS Callable, exchanges OAuth code
- `stravaDisconnect` - HTTPS Callable, revokes access

Helper functions:
- `getValidAccessToken(uid)` - Returns valid token, refreshes if expired
- `findUserByAthleteId(athleteId)` - Lookup Firebase UID from Strava athlete ID

### sync.ts
Activity sync logic:
- `syncRecentActivities(uid, token)` - Initial sync, last 30 days, paginated
- `syncActivityById(uid, token, activityId)` - Sync single activity
- `deleteActivityByExternalId(uid, externalId)` - Remove synced activity
- `updateActivityByExternalId(uid, token, activityId)` - Update activity metadata

Type mapping: Strava types → app types (Run→run, Hike→hike, etc.)

### webhook.ts
- `stravaWebhook` - HTTPS Request handler
  - GET: Webhook validation (hub.challenge)
  - POST: Queue activity events for async processing
  - Validates athlete exists before queuing (security)
- `processStravaWebhook` - Firestore trigger on `stravaWebhookQueue`
  - Fetches activity details from Strava
  - Transforms and stores in user's activities
  - Updates user stats

## Data Flow

### OAuth Connection
```
App → stravaTokenExchange(code) → Strava API → encrypt tokens → Firestore
                                            → syncRecentActivities()
```

### Webhook Event
```
Strava → stravaWebhook → validate athlete → stravaWebhookQueue
                                          ↓
                    processStravaWebhook → fetch activity → Firestore
```

## Token Management

Tokens expire in 6 hours. `getValidAccessToken()` handles this:
1. Check if `tokenExpiresAt > now + 1 minute`
2. If valid, decrypt and return access token
3. If expired, call `refreshAccessToken()`, update Firestore, return new token

**Critical**: New refresh tokens invalidate old ones. Always persist the latest.

## Activity Sync

### Initial Sync (on connect)
- Fetches last 30 days of activities
- Paginated: 100 per page, max 10 pages (1000 activities)
- Skips duplicates (checks `externalId`)
- Updates user stats for each new activity

### Webhook Sync (ongoing)
- Handles create, update, delete events
- Updates user stats accordingly (increment/decrement)

## Type Mapping

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

## Security Notes

- Strava doesn't sign webhook payloads
- Early athlete validation drops unknown `owner_id`s immediately
- Tokens encrypted with AES-256-GCM (see `utils/encryption.ts`)
- Client secret never exposed to mobile app
