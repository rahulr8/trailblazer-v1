import { useState, useEffect, useCallback } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStrava } from "@/contexts/strava-context";
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

  const { initiateOAuth, isConnecting, error: oauthError } = useStrava();

  // Listen to Firestore for connection status
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

  // Connect via context - handles OAuth flow
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null }));
    await initiateOAuth();
  }, [initiateOAuth]);

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
    isSyncing: state.isSyncing || isConnecting,
    error: state.error || oauthError,
    connect,
    disconnect,
    sync,
  };
}
