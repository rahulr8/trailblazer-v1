import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { decrypt, encrypt } from "../utils/encryption";
import { exchangeCodeForTokens, refreshAccessToken, revokeAccessToken } from "./api";
import { syncRecentActivities } from "./sync";
import { StravaConnectionDoc } from "./types";

const db = getFirestore();

interface TokenExchangeRequest {
  code: string;
  scopes: string[];
}

interface TokenExchangeResponse {
  success: boolean;
  athleteId: number;
  athleteName: string;
}

export const stravaTokenExchange = onCall<TokenExchangeRequest>(
  { cors: true },
  async (request): Promise<TokenExchangeResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { code, scopes } = request.data;

    if (!code) {
      throw new HttpsError("invalid-argument", "Authorization code is required");
    }

    const uid = request.auth.uid;

    try {
      const tokenResponse = await exchangeCodeForTokens(code);

      const stravaConnection: StravaConnectionDoc = {
        athleteId: tokenResponse.athlete.id,
        athleteUsername: tokenResponse.athlete.username,
        accessToken: encrypt(tokenResponse.access_token),
        refreshToken: encrypt(tokenResponse.refresh_token),
        tokenExpiresAt: Timestamp.fromMillis(tokenResponse.expires_at * 1000),
        scopes: scopes || ["activity:read"],
        connectedAt: FieldValue.serverTimestamp(),
        lastSyncAt: null,
      };

      await db.doc(`users/${uid}`).update({
        stravaConnection,
      });

      await syncRecentActivities(uid, tokenResponse.access_token);

      await db.doc(`users/${uid}`).update({
        "stravaConnection.lastSyncAt": FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        athleteId: tokenResponse.athlete.id,
        athleteName: `${tokenResponse.athlete.firstname} ${tokenResponse.athlete.lastname}`,
      };
    } catch (error) {
      console.error("Strava token exchange error:", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Token exchange failed"
      );
    }
  }
);

export const stravaDisconnect = onCall(
  { cors: true },
  async (request): Promise<{ success: boolean }> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;

    try {
      const userDoc = await db.doc(`users/${uid}`).get();
      const userData = userDoc.data();

      if (!userData?.stravaConnection) {
        throw new HttpsError("not-found", "No Strava connection found");
      }

      const accessToken = decrypt(userData.stravaConnection.accessToken);

      try {
        await revokeAccessToken(accessToken);
      } catch (revokeError) {
        console.warn("Failed to revoke Strava token:", revokeError);
      }

      await db.doc(`users/${uid}`).update({
        stravaConnection: FieldValue.delete(),
      });

      return { success: true };
    } catch (error) {
      console.error("Strava disconnect error:", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Disconnect failed"
      );
    }
  }
);

export async function getValidAccessToken(uid: string): Promise<string> {
  const userDoc = await db.doc(`users/${uid}`).get();
  const userData = userDoc.data();

  if (!userData?.stravaConnection) {
    throw new Error("No Strava connection found");
  }

  const connection = userData.stravaConnection as StravaConnectionDoc;
  const expiresAt = (connection.tokenExpiresAt as Timestamp).toMillis();
  const now = Date.now();

  if (expiresAt > now + 60000) {
    return decrypt(connection.accessToken);
  }

  const refreshToken = decrypt(connection.refreshToken);
  const tokenResponse = await refreshAccessToken(refreshToken);

  await db.doc(`users/${uid}`).update({
    "stravaConnection.accessToken": encrypt(tokenResponse.access_token),
    "stravaConnection.refreshToken": encrypt(tokenResponse.refresh_token),
    "stravaConnection.tokenExpiresAt": Timestamp.fromMillis(tokenResponse.expires_at * 1000),
  });

  return tokenResponse.access_token;
}

export const stravaSync = onCall(
  { cors: true },
  async (request): Promise<{ success: boolean; syncedCount: number }> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const uid = request.auth.uid;

    try {
      const accessToken = await getValidAccessToken(uid);
      const syncedCount = await syncRecentActivities(uid, accessToken);

      await db.doc(`users/${uid}`).update({
        "stravaConnection.lastSyncAt": FieldValue.serverTimestamp(),
      });

      return { success: true, syncedCount };
    } catch (error) {
      console.error("Strava sync error:", error);
      throw new HttpsError(
        "internal",
        error instanceof Error ? error.message : "Sync failed"
      );
    }
  }
);

export async function findUserByAthleteId(athleteId: number): Promise<string | null> {
  const usersSnapshot = await db
    .collection("users")
    .where("stravaConnection.athleteId", "==", athleteId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    return null;
  }

  return usersSnapshot.docs[0].id;
}
