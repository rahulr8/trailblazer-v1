# Strava Module (`lib/strava/`)

React Native / Expo client-side Strava OAuth integration.

## Structure

```
lib/strava/
├── index.ts    # Exports useStravaConnection
├── config.ts   # OAuth configuration constants
└── hooks.ts    # useStravaConnection hook for UI
```

Also:
```
contexts/
└── strava-context.tsx  # StravaProvider with OAuth logic
```

## Dependencies

```bash
npx expo install expo-web-browser expo-linking
```

## Configuration

`config.ts` exports:
- `STRAVA_CLIENT_ID` - from `EXPO_PUBLIC_STRAVA_CLIENT_ID` env var
- `STRAVA_AUTH_ENDPOINT` - `https://www.strava.com/oauth/authorize`
- `STRAVA_SCOPES` - `["activity:read"]`
- `STRAVA_REDIRECT_PATH` - `trailblazerplus`

**Important**: The app scheme must be `trailblazerplus` (set in `app.json`).

## OAuth Flow

1. User taps "Connect Strava" → `useStravaConnection.connect()` calls `initiateOAuth()`
2. `StravaProvider` opens OAuth browser via `WebBrowser.openAuthSessionAsync()`
3. User authorizes in Strava app or mobile web
4. Browser returns with authorization code directly as promise result
5. `StravaProvider` exchanges code via Cloud Function `stravaTokenExchange`
6. Cloud Function stores encrypted tokens in Firestore
7. `useStravaConnection` Firestore listener picks up the new connection status

## Architecture

OAuth is handled by `StravaProvider` (in `contexts/strava-context.tsx`):
- Uses `WebBrowser.openAuthSessionAsync()` which returns the redirect URL directly
- No need for deep link listeners or expo-auth-session
- Always mounted at root level via `_layout.tsx`

```tsx
// app/_layout.tsx
<AuthProvider>
  <StravaProvider>  {/* OAuth logic here */}
    <RootLayoutNav />
  </StravaProvider>
</AuthProvider>
```

### useStravaConnection(uid)
High-level hook for UI integration:
```typescript
const {
  isConnected,      // boolean - has active Strava connection
  isLoading,        // boolean - loading state
  isSyncing,        // boolean - syncing activities or connecting
  athleteId,        // number | null
  athleteUsername,  // string | null
  lastSyncAt,       // Date | null
  error,            // string | null
  connect,          // () => Promise<void> - start OAuth flow
  disconnect,       // () => Promise<void> - revoke and remove
  sync,             // () => Promise<number> - sync activities
} = useStravaConnection(uid);
```

## Usage Example

```typescript
import { useStravaConnection } from '@/lib/strava';

function SettingsScreen() {
  const { uid } = useAuth();
  const { isConnected, connect, disconnect, isLoading, isSyncing } = useStravaConnection(uid);

  return (
    <Button
      onPress={isConnected ? disconnect : connect}
      disabled={isLoading || isSyncing}
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
- "Must be logged in" - No Firebase auth
- "No code in redirect URL" - OAuth redirect failed
- Token exchange failures from Strava API
