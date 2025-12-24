export const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || "";

export const stravaDiscovery = {
  authorizationEndpoint: "https://www.strava.com/oauth/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

export const STRAVA_SCOPES = ["activity:read"];

export const STRAVA_REDIRECT_PATH = "strava-callback";
