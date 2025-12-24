import { useState, useEffect, useCallback } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStravaAuth, getAuthorizationCode } from "./auth";
import { STRAVA_SCOPES } from "./config";
import { StravaConnection } from "@/lib/db/types";

interface StravaConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  athleteId: number | null;
  athleteUsername: string | null;
  lastSyncAt: Date | null;
  error: string | null;
}

interface UseStravaConnectionReturn extends StravaConnectionState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: () => Promise<number>;
}

export function useStravaConnection(uid: string | null): UseStravaConnectionReturn {
  const [state, setState] = useState<StravaConnectionState>({
    isConnected: false,
    isLoading: true,
    isSyncing: false,
    athleteId: null,
    athleteUsername: null,
    lastSyncAt: null,
    error: null,
  });

  const { response, promptAsync, isReady } = useStravaAuth();

  useEffect(() => {
    if (!uid) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        const data = snapshot.data();
        const connection = data?.stravaConnection as StravaConnection | undefined;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isConnected: !!connection,
          athleteId: connection?.athleteId || null,
          athleteUsername: connection?.athleteUsername || null,
          lastSyncAt: connection?.lastSyncAt?.toDate() || null,
        }));
      },
      (error) => {
        console.error("Strava connection listener error:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load Strava connection status",
        }));
      }
    );

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    console.log("[Strava Hook] Response effect triggered, type:", response?.type);
    const code = getAuthorizationCode(response);
    console.log("[Strava Hook] Code extracted:", !!code, "uid:", !!uid);

    if (code && uid) {
      console.log("[Strava Hook] Starting token exchange...");
      exchangeToken(uid, code);
    } else if (response?.type === "error") {
      const errorMsg =
        (response.params as Record<string, string>)?.error_description || "Authorization failed";
      setState((prev) => ({ ...prev, error: errorMsg }));
    }
  }, [response, uid]);

  const exchangeToken = async (userId: string, code: string) => {
    console.log("[Strava Hook] Exchanging token for user:", userId);
    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const functions = getFunctions();
      const stravaTokenExchange = httpsCallable<
        { code: string; scopes: string[] },
        { success: boolean; athleteId: number; athleteName: string }
      >(functions, "stravaTokenExchange");

      console.log("[Strava Hook] Calling Cloud Function stravaTokenExchange...");
      const result = await stravaTokenExchange({ code, scopes: STRAVA_SCOPES });
      console.log("[Strava Hook] Token exchange successful:", result.data);
    } catch (error) {
      console.error("[Strava Hook] Token exchange failed:", error);
      let errorMessage = "Failed to connect Strava";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setState((prev) => ({ ...prev, error: errorMessage }));
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  const connect = useCallback(async () => {
    console.log("[Strava Hook] Connect called, isReady:", isReady);
    if (!isReady) {
      console.warn("[Strava Hook] Auth not ready yet");
      setState((prev) => ({ ...prev, error: "Auth not ready" }));
      return;
    }

    setState((prev) => ({ ...prev, error: null }));

    try {
      console.log("[Strava Hook] Opening OAuth prompt...");
      await promptAsync();
      console.log("[Strava Hook] OAuth prompt completed");
    } catch (error) {
      console.error("[Strava Hook] Auth prompt error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to open Strava",
      }));
    }
  }, [isReady, promptAsync]);

  const disconnect = useCallback(async () => {
    if (!uid) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const functions = getFunctions();
      const stravaDisconnect = httpsCallable<void, { success: boolean }>(
        functions,
        "stravaDisconnect"
      );

      await stravaDisconnect();
    } catch (error) {
      console.error("Strava disconnect error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to disconnect",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [uid]);

  const sync = useCallback(async (): Promise<number> => {
    if (!uid || !state.isConnected) return 0;

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const functions = getFunctions();
      const stravaSync = httpsCallable<void, { success: boolean; syncedCount: number }>(
        functions,
        "stravaSync"
      );

      const result = await stravaSync();
      return result.data.syncedCount;
    } catch (error) {
      console.error("Strava sync error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to sync",
      }));
      return 0;
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [uid, state.isConnected]);

  return {
    ...state,
    connect,
    disconnect,
    sync,
  };
}
