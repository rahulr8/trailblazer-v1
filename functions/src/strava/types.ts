import { Timestamp, FieldValue } from "firebase-admin/firestore";

// Strava API response types
export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  city: string | null;
  state: string | null;
  country: string | null;
  profile: string;
  profile_medium: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  map?: {
    id: string;
    summary_polyline: string | null;
    polyline: string | null;
  };
}

// Webhook event types
export interface StravaWebhookEvent {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  updates?: Record<string, string>;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

// Firestore document types
export interface StravaConnectionDoc {
  athleteId: number;
  athleteUsername: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Timestamp;
  scopes: string[];
  connectedAt: Timestamp | FieldValue;
  lastSyncAt: Timestamp | FieldValue | null;
}

export interface WebhookQueueDoc {
  objectType: "activity" | "athlete";
  objectId: number;
  aspectType: "create" | "update" | "delete";
  ownerId: number;
  eventTime: number;
  receivedAt: Timestamp | FieldValue;
  processedAt: Timestamp | FieldValue | null;
}

export interface ActivityDoc {
  source: "manual" | "strava";
  externalId: string | null;
  type: string;
  duration: number;
  distance: number;
  location: string | null;
  date: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
  elapsedTime?: number;
  elevationGain?: number;
  name?: string;
  sportType?: string;
}

// API request types
export interface FetchActivitiesOptions {
  before?: number;
  after?: number;
  page?: number;
  per_page?: number;
}
