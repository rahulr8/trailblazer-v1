import { Timestamp } from "firebase/firestore";
import { Adventure } from "@/lib/data";

// Strava connection stored on user document
export interface StravaConnection {
  athleteId: number;
  athleteUsername: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Timestamp;
  scopes: string[];
  connectedAt: Timestamp;
  lastSyncAt: Timestamp | null;
}

// Firestore document types
export interface UserDocument {
  email: string;
  displayName: string | null;
  photoURL: string | null;
  membershipTier: "free" | "platinum";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityDate?: Timestamp;
  stats: UserStats;
  stravaConnection?: StravaConnection;
}

export interface UserStats {
  totalKm: number;
  totalMinutes: number;
  totalSteps: number;
  currentStreak: number;
}

export type ActivitySource = "manual" | "strava";

export interface ActivityDocument {
  source: ActivitySource;
  externalId: string | null;
  type: string;
  duration: number;
  distance: number;
  location: string | null;
  date: Timestamp;
  createdAt: Timestamp;
  elapsedTime?: number;
  elevationGain?: number;
  name?: string;
  sportType?: string;
}

export interface SavedAdventureDocument {
  adventure: Adventure;
  savedAt: Timestamp;
}

// Input types
export interface CreateUserInput {
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface LogActivityInput {
  type: string;
  duration: number;
  distance: number;
  location: string | null;
}

export interface StatDeltas {
  km?: number;
  minutes?: number;
  steps?: number;
}

// Return types (converted from Firestore)
export interface Activity {
  id: string;
  source: ActivitySource;
  externalId: string | null;
  type: string;
  duration: number;
  distance: number;
  location: string | null;
  date: Date;
  elapsedTime?: number;
  elevationGain?: number;
  name?: string;
  sportType?: string;
}

export interface QueryOptions {
  limit?: number;
  orderByDate?: "asc" | "desc";
}

// Conversation types for AI chat tracking (nested structure)
export interface ConversationDocument {
  userId: string | null;
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  messageCount: number;
}

export interface MessageDocument {
  query: string;
  response: string;
  timestamp: Timestamp;
}

export interface LogMessageInput {
  userId: string | null;
  sessionId: string;
  query: string;
  response: string;
}

export interface Conversation {
  id: string;
  userId: string | null;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

export interface Message {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}
