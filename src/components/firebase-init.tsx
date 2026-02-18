"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

/**
 * Initializes Firebase (analytics) when config is available (env or private/firebase.md not used on client).
 * Add to root layout so the app connects to Firebase on load.
 */
export function FirebaseInit() {
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);
  return null;
}
