import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, querySnapshotToArray } from "./utils";
import { SavedAdventureDocument } from "./types";
import { Adventure } from "@/lib/data";

// Save an adventure
export async function saveAdventure(
  uid: string,
  adventure: Adventure
): Promise<void> {
  const adventureRef = doc(
    db,
    collections.savedAdventures(uid),
    adventure.id.toString()
  );

  await setDoc(adventureRef, {
    adventure,
    savedAt: serverTimestamp(),
  });
}

// Remove saved adventure
export async function removeSavedAdventure(
  uid: string,
  adventureId: number
): Promise<void> {
  const adventureRef = doc(
    db,
    collections.savedAdventures(uid),
    adventureId.toString()
  );

  await deleteDoc(adventureRef);
}

// Get all saved adventures
export async function getSavedAdventures(uid: string): Promise<Adventure[]> {
  const savedRef = collection(db, collections.savedAdventures(uid));
  const snapshot = await getDocs(savedRef);

  const docs = querySnapshotToArray<SavedAdventureDocument>(snapshot.docs);

  return docs.map((doc) => doc.adventure);
}

// Check if adventure is saved
export async function isAdventureSaved(
  uid: string,
  adventureId: number
): Promise<boolean> {
  const adventures = await getSavedAdventures(uid);
  return adventures.some((a) => a.id === adventureId);
}
