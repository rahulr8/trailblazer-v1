import { initializeApp } from "firebase-admin/app";

initializeApp();

export { stravaTokenExchange, stravaDisconnect, stravaSync } from "./strava/auth";
export { stravaWebhook, processStravaWebhook } from "./strava/webhook";
