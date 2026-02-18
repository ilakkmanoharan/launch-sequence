"use client";

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseConfigFromEnv } from "./firebase-config";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let firestore: Firestore | null = null;

function getApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (app) return app;
  const config = getFirebaseConfigFromEnv();
  if (!config) return null;
  app = initializeApp(config);
  return app;
}

export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  const a = getApp();
  if (!a) return null;
  if (!analytics) analytics = getAnalytics(a);
  return analytics;
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  const a = getApp();
  if (!a) return null;
  if (!firestore) firestore = getFirestore(a);
  return firestore;
}

export { getApp };
