# Strava Module (`lib/strava/`)

React Native / Expo client-side Strava OAuth integration.

## Structure

```
lib/strava/
├── index.ts    # Re-exports all modules
├── config.ts   # OAuth endpoints and configuration
├── auth.ts     # expo-auth-session hook for OAuth flow
└── hooks.ts    # useStravaConnection hook for UI
```

## Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-secure-store expo-web-browser
```

## Configuration

OAuth is configured in `config.ts`:
- Client ID from `EXPO_PUBLIC_STRAVA_CLIENT_ID` env var
- Mobile OAuth endpoint: `https://www.strava.com/oauth/mobile/authorize`
- Scopes: `["activity:read"]`
- Redirect path: `strava-callback`

**Important**: The app scheme must be `trailblazerplus` (set in `app.json`).

## OAuth Flow

1. User taps "Connect Strava"
2. `useStravaAuth()` opens Strava's mobile OAuth page
3. User authorizes in Strava app or mobile web
4. Strava redirects back with authorization code
5. App sends code to Cloud Function `stravaTokenExchange`
6. Cloud Function exchanges code for tokens, stores encrypted in Firestore
7. Initial sync fetches last 30 days of activities

## Hooks

### useStravaAuth()
Low-level hook wrapping `expo-auth-session`:
```typescript
const { request, response, promptAsync, isReady } = useStravaAuth();
```

### useStravaConnection(uid)
High-level hook for UI integration:
```typescript
const {
  isConnected,      // boolean - has active Strava connection
  isLoading,        // boolean - loading state
  isSyncing,        // boolean - syncing activities
  athleteId,        // number | null
  athleteUsername,  // string | null
  lastSyncAt,       // Date | null
  error,            // string | null
  connect,          // () => Promise<void> - start OAuth flow
  disconnect,       // () => Promise<void> - revoke and remove
} = useStravaConnection(uid);
```

## Usage Example

```typescript
import { useStravaConnection } from '@/lib/strava';

function SettingsScreen() {
  const { uid } = useAuth();
  const { isConnected, connect, disconnect, isLoading } = useStravaConnection(uid);

  return (
    <Button
      onPress={isConnected ? disconnect : connect}
      disabled={isLoading}
    >
      {isConnected ? 'Disconnect Strava' : 'Connect Strava'}
    </Button>
  );
}
```

## Token Exchange

The OAuth code is exchanged for tokens via the `stravaTokenExchange` Cloud Function. This keeps the client secret server-side. Tokens are encrypted before storage in Firestore.

## Error Handling

The hook captures errors in the `error` state. Common errors:
- "Auth not ready" - OAuth request not initialized
- "User must be authenticated" - No Firebase auth
- Token exchange failures from Strava API
