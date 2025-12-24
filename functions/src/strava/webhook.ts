import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

import { findUserByAthleteId, getValidAccessToken } from "./auth";
import { deleteActivityByExternalId, syncActivityById, updateActivityByExternalId } from "./sync";
import { StravaWebhookEvent, WebhookQueueDoc } from "./types";

const db = getFirestore();

function getVerifyToken(): string {
  const token = process.env.STRAVA_VERIFY_TOKEN;
  if (!token) throw new Error("STRAVA_VERIFY_TOKEN not configured");
  return token;
}

export const stravaWebhook = onRequest({ cors: false }, async (req, res): Promise<void> => {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];

    if (mode === "subscribe" && verifyToken === getVerifyToken()) {
      console.log("Strava webhook validated");
      res.json({ "hub.challenge": challenge });
      return;
    }

    res.status(403).send("Invalid verify token");
    return;
  }

  if (req.method === "POST") {
    const event = req.body as StravaWebhookEvent;

    console.log("Strava webhook received:", JSON.stringify(event));

    if (event.object_type !== "activity") {
      if (
        event.object_type === "athlete" &&
        event.aspect_type === "update" &&
        event.updates?.["authorized"] === "false"
      ) {
        console.log(`Athlete ${event.owner_id} deauthorized app`);
      }
      res.status(200).send("OK");
      return;
    }

    const uid = await findUserByAthleteId(event.owner_id);
    if (!uid) {
      console.log(`Ignoring webhook for unknown athlete ${event.owner_id}`);
      res.status(200).send("OK");
      return;
    }

    const queueDoc: WebhookQueueDoc = {
      objectType: event.object_type,
      objectId: event.object_id,
      aspectType: event.aspect_type,
      ownerId: event.owner_id,
      eventTime: event.event_time,
      receivedAt: FieldValue.serverTimestamp(),
      processedAt: null,
    };

    await db.collection("stravaWebhookQueue").add(queueDoc);

    res.status(200).send("OK");
    return;
  }

  res.status(405).send("Method not allowed");
});

export const processStravaWebhook = onDocumentCreated(
  "stravaWebhookQueue/{docId}",
  async (event): Promise<void> => {
    const snapshot = event.data;
    if (!snapshot) {
      console.error("No data in webhook queue document");
      return;
    }

    const data = snapshot.data() as WebhookQueueDoc;

    console.log(
      `Processing Strava webhook: ${data.aspectType} ${data.objectType} ${data.objectId}`
    );

    try {
      const uid = await findUserByAthleteId(data.ownerId);

      if (!uid) {
        console.warn(`No user found for athlete ${data.ownerId}`);
        await snapshot.ref.update({
          processedAt: FieldValue.serverTimestamp(),
          error: "User not found",
        });
        return;
      }

      const accessToken = await getValidAccessToken(uid);

      switch (data.aspectType) {
        case "create":
          await syncActivityById(uid, accessToken, data.objectId);
          console.log(`Synced new activity ${data.objectId} for user ${uid}`);
          break;

        case "update":
          await updateActivityByExternalId(uid, accessToken, data.objectId);
          console.log(`Updated activity ${data.objectId} for user ${uid}`);
          break;

        case "delete":
          await deleteActivityByExternalId(uid, data.objectId.toString());
          console.log(`Deleted activity ${data.objectId} for user ${uid}`);
          break;

        default:
          console.warn(`Unknown aspect type: ${data.aspectType}`);
      }

      await snapshot.ref.update({
        processedAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      await snapshot.ref.update({
        processedAt: FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : "Processing failed",
      });
    }
  }
);
