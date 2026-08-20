import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAWumdXeFZ7aMqn95ldxIubNWFKVAtM_C8",
  authDomain: "mindweave-61f56.firebaseapp.com",
  projectId: "mindweave-61f56",
  storageBucket: "mindweave-61f56.firebasestorage.app",
  messagingSenderId: "190024226538",
  appId: "1:190024226538:web:ca62ef290bb002e8fee993",
  measurementId: "G-ZS6SFDL11W"
};

// Prevent duplicate initializations during server/client hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Safely initialize analytics only on client-side environments
export const analyticsPromise = typeof window !== "undefined"
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
  : Promise.resolve(null);
