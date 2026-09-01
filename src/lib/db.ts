import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Returns the Firebase Admin Firestore instance.
 * firebase-admin must be initialized (via initAdmin in serverFunctions.ts) before calling this.
 */
export function getDb(): Firestore {
  return getFirestore();
}
