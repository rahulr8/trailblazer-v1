# Firebase Cloud Functions (`functions/`)

Backend for Trailblazer+ handling Strava OAuth, webhooks, and activity sync.

## Structure

```
functions/
├── package.json
├── tsconfig.json
├── .env.example      # Required environment variables
├── .gitignore
└── src/
    ├── index.ts      # Exports all Cloud Functions
    ├── strava/       # Strava integration (see strava/CLAUDE.md)
    └── utils/
        └── encryption.ts  # AES-256-GCM token encryption
```

## Commands

```bash
npm run build         # Compile TypeScript
npm run typecheck     # Type check without emit
npm run serve         # Local emulator
npm run deploy        # Deploy to Firebase
```

## Exported Functions

| Function | Type | Purpose |
|----------|------|---------|
| `stravaTokenExchange` | HTTPS Callable | Exchange OAuth code for tokens |
| `stravaDisconnect` | HTTPS Callable | Revoke Strava access |
| `stravaWebhook` | HTTPS Request | Receive Strava webhook events |
| `processStravaWebhook` | Firestore Trigger | Process queued webhook events |

## Environment Variables

Create `.env` file (never commit):

```bash
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_VERIFY_TOKEN=random_string_for_webhook

# AES-256 key: 32 bytes = 64 hex characters
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_string
```

## Deployment

```bash
# Build and deploy functions
npm run build && firebase deploy --only functions

# Deploy Firestore indexes (required for athlete lookup)
firebase deploy --only firestore:indexes
```

## Webhook Registration

After deploying, register the webhook subscription once:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://REGION-PROJECT.cloudfunctions.net/stravaWebhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

## Security

- Client secret only exists in Cloud Functions environment
- Tokens encrypted with AES-256-GCM before Firestore storage
- Webhook validates athlete exists before queuing (drops unknown)
- Token refresh handled automatically when tokens expire

## Rate Limits

Strava API limits: 200 requests/15 min, 2000 requests/day.
- Initial sync: 1-10 requests (paginated)
- Per webhook: 1 request
