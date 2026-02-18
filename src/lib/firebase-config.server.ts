import { readFile } from "fs/promises";
import path from "path";
import type { FirebaseConfig } from "./firebase-config";

/**
 * Server-only: get Firebase config from env or from private/firebase.md.
 * Use in API routes or server components when you want to connect using the .md file.
 */
export async function getFirebaseConfig(): Promise<FirebaseConfig | null> {
  const { getFirebaseConfigFromEnv } = await import("./firebase-config");
  const fromEnv = getFirebaseConfigFromEnv();
  if (fromEnv) return fromEnv;

  try {
    const filePath = path.join(process.cwd(), "private", "firebase.md");
    const content = await readFile(filePath, "utf-8");
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (!jsonMatch) return null;
    const config = JSON.parse(jsonMatch[1].trim()) as FirebaseConfig;
    return config.apiKey && config.projectId ? config : null;
  } catch {
    return null;
  }
}
