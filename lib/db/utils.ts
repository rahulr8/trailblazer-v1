import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

// Generic document data extractor with type safety
export function getDocData<T>(snapshot: DocumentSnapshot): T | null {
  if (!snapshot.exists()) return null;
  return snapshot.data() as T;
}

// Extract data from query snapshot with ID
export function getQueryDocData<T>(
  snapshot: QueryDocumentSnapshot
): T & { id: string } {
  return {
    id: snapshot.id,
    ...(snapshot.data() as T),
  };
}

// Convert Firestore Timestamp to Date
export function timestampToDate(timestamp: Timestamp | undefined): Date {
  return timestamp?.toDate() || new Date();
}

// Convert multiple query docs to array with IDs
export function querySnapshotToArray<T>(
  docs: QueryDocumentSnapshot[]
): Array<T & { id: string }> {
  return docs.map((doc) => getQueryDocData<T>(doc));
}

// Collection path builders (prevents typos)
export const collections = {
  users: "users",
  activities: (uid: string) => `users/${uid}/activities`,
  savedAdventures: (uid: string) => `users/${uid}/savedAdventures`,
  conversations: "conversations",
  messages: (sessionId: string) => `conversations/${sessionId}/messages`,
  stravaWebhookQueue: "stravaWebhookQueue",
} as const;
