# Database Module (`lib/db/`)

Firestore database operations for Trailblazer+.

## Structure

```
lib/db/
├── index.ts          # Re-exports all modules
├── types.ts          # TypeScript interfaces for Firestore documents
├── utils.ts          # Collection paths, helpers
├── users.ts          # User CRUD, stats, streaks
├── activities.ts     # Activity logging and queries
├── savedAdventures.ts # Saved adventure operations
└── chatLogs.ts       # AI conversation tracking
```

## Firestore Collections

```
users/{uid}
├── activities/{activityId}      # User's logged activities
└── savedAdventures/{adventureId} # Saved adventures

conversations/{sessionId}
└── messages/{messageId}          # Chat messages

stravaWebhookQueue/{docId}        # Webhook processing queue (Cloud Functions)
```

## Key Types

### UserDocument
- `email`, `displayName`, `photoURL`
- `membershipTier`: `"free"` | `"platinum"`
- `stats`: `{ totalKm, totalMinutes, totalSteps, currentStreak }`
- `stravaConnection?`: Strava OAuth tokens and athlete info (encrypted)

### ActivityDocument
- `source`: `"manual"` | `"strava"` - tracks where activity came from
- `externalId`: Strava activity ID (null for manual)
- `type`: `"run"` | `"hike"` | `"bike"` | `"walk"` | etc.
- `duration`: seconds
- `distance`: kilometers
- `location`: city name or null
- `date`, `createdAt`: Timestamps
- Strava-specific optional fields: `elapsedTime`, `elevationGain`, `name`, `sportType`

### StravaConnection (on UserDocument)
- `athleteId`: Strava athlete ID (indexed for webhook lookups)
- `athleteUsername`: Strava username
- `accessToken`, `refreshToken`: Encrypted tokens
- `tokenExpiresAt`: Token expiration timestamp
- `scopes`: Authorized scopes
- `connectedAt`, `lastSyncAt`: Sync timestamps

## Collection Paths

Use `collections` object from `utils.ts` to prevent typos:

```typescript
import { collections } from '@/lib/db';

collections.users                    // "users"
collections.activities(uid)          // "users/{uid}/activities"
collections.savedAdventures(uid)     // "users/{uid}/savedAdventures"
collections.stravaWebhookQueue       // "stravaWebhookQueue"
```

## Activity Logging

When logging activities, the `source` field is automatically set:
- Manual activities via `logActivity()`: `source: "manual"`, `externalId: null`
- Strava activities (via Cloud Functions): `source: "strava"`, `externalId: "<strava_id>"`

User stats are automatically updated when activities are logged.

## Firestore Indexes

Required index for Strava webhook processing (in `firestore.indexes.json`):
- `users` collection, `stravaConnection.athleteId` field (ASCENDING)

Deploy with: `firebase deploy --only firestore:indexes`
