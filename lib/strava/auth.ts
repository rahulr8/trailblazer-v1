import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { stravaDiscovery, STRAVA_CLIENT_ID, STRAVA_SCOPES } from "./config";

WebBrowser.maybeCompleteAuthSession();

export function useStravaAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "trailblazerplus",
    preferLocalhost: true,
  });

  console.log("Strava redirect URI:", redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: STRAVA_CLIENT_ID,
      scopes: STRAVA_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    },
    stravaDiscovery
  );

  return {
    request,
    response,
    promptAsync,
    redirectUri,
    isReady: !!request,
  };
}

export function getAuthorizationCode(
  response: AuthSession.AuthSessionResult | null
): string | null {
  console.log("[Strava OAuth] Processing response:", response?.type);

  if (!response) {
    console.log("[Strava OAuth] No response received");
    return null;
  }

  if (response.type === "success") {
    const code = response.params?.code;
    if (code) {
      console.log("[Strava OAuth] Authorization code received");
      return code;
    }
    console.warn("[Strava OAuth] Success response but no code in params:", response.params);
    return null;
  }

  if (response.type === "dismiss") {
    console.log("[Strava OAuth] User dismissed dialog");
    return null;
  }

  if (response.type === "error") {
    console.error(
      "[Strava OAuth] Error:",
      response.params?.error,
      response.params?.error_description
    );
    return null;
  }

  console.warn("[Strava OAuth] Unknown response type:", response.type);
  return null;
}
