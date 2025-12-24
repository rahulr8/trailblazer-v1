import { FetchActivitiesOptions, StravaActivity, StravaTokenResponse } from "./types";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_AUTH_BASE = "https://www.strava.com/oauth";

function getClientId(): string {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) throw new Error("STRAVA_CLIENT_ID not configured");
  return clientId;
}

function getClientSecret(): string {
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientSecret) throw new Error("STRAVA_CLIENT_SECRET not configured");
  return clientSecret;
}

export async function exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
  const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token exchange failed: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token refresh failed: ${error}`);
  }

  return response.json();
}

export async function revokeAccessToken(accessToken: string): Promise<void> {
  const response = await fetch(`${STRAVA_AUTH_BASE}/deauthorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: accessToken }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token revocation failed: ${error}`);
  }
}

export async function fetchActivities(
  accessToken: string,
  options: FetchActivitiesOptions = {}
): Promise<StravaActivity[]> {
  const params = new URLSearchParams();

  if (options.before) params.set("before", options.before.toString());
  if (options.after) params.set("after", options.after.toString());
  if (options.page) params.set("page", options.page.toString());
  if (options.per_page) params.set("per_page", options.per_page.toString());

  const url = `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava fetch activities failed: ${error}`);
  }

  return response.json();
}

export async function fetchActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity> {
  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava fetch activity ${activityId} failed: ${error}`);
  }

  return response.json();
}
