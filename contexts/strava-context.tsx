import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { httpsCallable, getFunctions } from "firebase/functions";
import { useAuth } from "./auth-context";
import {
  STRAVA_CLIENT_ID,
  STRAVA_AUTH_ENDPOINT,
  STRAVA_SCOPES,
  STRAVA_REDIRECT_PATH,
} from "@/lib/strava/config";

interface StravaContextValue {
  initiateOAuth: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const StravaContext = createContext<StravaContextValue | null>(null);

export function StravaProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateOAuth = useCallback(async () => {
    if (!uid) {
      setError("Must be logged in");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const redirectUri = Linking.createURL(STRAVA_REDIRECT_PATH);
      const authUrl = `${STRAVA_AUTH_ENDPOINT}?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${STRAVA_SCOPES.join(",")}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success") {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code;

        if (code && typeof code === "string") {
          const functions = getFunctions();
          const stravaTokenExchange = httpsCallable<
            { code: string; scopes: string[] },
            { success: boolean; athleteId: number; athleteName: string }
          >(functions, "stravaTokenExchange");
          await stravaTokenExchange({ code, scopes: STRAVA_SCOPES });
        } else {
          throw new Error("No code in redirect URL");
        }
      }
    } catch (err) {
      console.error("[Strava] OAuth error:", err);
      setError(err instanceof Error ? err.message : "OAuth failed");
    } finally {
      setIsConnecting(false);
    }
  }, [uid]);

  return (
    <StravaContext.Provider value={{ initiateOAuth, isConnecting, error }}>
      {children}
    </StravaContext.Provider>
  );
}

export function useStrava(): StravaContextValue {
  const context = useContext(StravaContext);
  if (!context) {
    throw new Error("useStrava must be used within StravaProvider");
  }
  return context;
}
