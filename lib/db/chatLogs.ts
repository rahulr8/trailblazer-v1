import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, querySnapshotToArray, timestampToDate } from "./utils";
import {
  ConversationDocument,
  MessageDocument,
  LogMessageInput,
  Conversation,
  Message,
} from "./types";

// Log a chat message (creates conversation if first message)
export async function logChatMessage(input: LogMessageInput): Promise<string> {
  const conversationRef = doc(db, collections.conversations, input.sessionId);
  const messagesRef = collection(db, collections.messages(input.sessionId));

  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    await setDoc(conversationRef, {
      userId: input.userId,
      startedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
      messageCount: 1,
    });
  } else {
    await setDoc(
      conversationRef,
      {
        lastMessageAt: serverTimestamp(),
        messageCount: increment(1),
      },
      { merge: true }
    );
  }

  const messageRef = await addDoc(messagesRef, {
    query: input.query,
    response: input.response,
    timestamp: serverTimestamp(),
  });

  return messageRef.id;
}

// Get all conversations (for admin/research)
export async function getConversations(limitCount?: number): Promise<Conversation[]> {
  const conversationsRef = collection(db, collections.conversations);

  let q = query(conversationsRef, orderBy("lastMessageAt", "desc"));

  if (limitCount) {
    q = query(q, firestoreLimit(limitCount));
  }

  const snapshot = await getDocs(q);
  const docs = querySnapshotToArray<ConversationDocument>(snapshot.docs);

  return docs.map((conv) => ({
    id: conv.id,
    userId: conv.userId,
    startedAt: timestampToDate(conv.startedAt),
    lastMessageAt: timestampToDate(conv.lastMessageAt),
    messageCount: conv.messageCount,
  }));
}

// Get conversations by user ID
export async function getConversationsByUser(
  userId: string,
  limitCount?: number
): Promise<Conversation[]> {
  const conversationsRef = collection(db, collections.conversations);

  let q = query(
    conversationsRef,
    where("userId", "==", userId),
    orderBy("lastMessageAt", "desc")
  );

  if (limitCount) {
    q = query(q, firestoreLimit(limitCount));
  }

  const snapshot = await getDocs(q);
  const docs = querySnapshotToArray<ConversationDocument>(snapshot.docs);

  return docs.map((conv) => ({
    id: conv.id,
    userId: conv.userId,
    startedAt: timestampToDate(conv.startedAt),
    lastMessageAt: timestampToDate(conv.lastMessageAt),
    messageCount: conv.messageCount,
  }));
}

// Get messages for a conversation
export async function getConversationMessages(sessionId: string): Promise<Message[]> {
  const messagesRef = collection(db, collections.messages(sessionId));

  const q = query(messagesRef, orderBy("timestamp", "asc"));

  const snapshot = await getDocs(q);
  const docs = querySnapshotToArray<MessageDocument>(snapshot.docs);

  return docs.map((msg) => ({
    id: msg.id,
    query: msg.query,
    response: msg.response,
    timestamp: timestampToDate(msg.timestamp),
  }));
}
