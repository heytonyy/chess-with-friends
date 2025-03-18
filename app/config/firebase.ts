import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  Auth,
  Persistence
} from "firebase/auth";
// import { Platform } from "react-native";
// import { MMKV } from "react-native-mmkv";

// // Create MMKV instance
// const storage = new MMKV({ id: 'auth-storage' });

// // Create a custom persistence layer for MMKV
// const MMKVPersistence: Persistence = {
//   type: 'custom' as const,
//   async get(key: string): Promise<string | null> {
//     const value = storage.getString(key);
//     return value || null;
//   },
//   async set(key: string, value: string): Promise<void> {
//     storage.set(key, value);
//   },
//   async remove(key: string): Promise<void> {
//     storage.delete(key);
//   }
// };

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with persistence
let auth: Auth = getAuth(app);;


// if (Platform.OS === 'web') {
//   // For web, use the default persistence
//   auth = getAuth(app);
// } else {
//   // For React Native (iOS/Android), use MMKV persistence
//   auth = initializeAuth(app, {
//     persistence: MMKVPersistence,
//   });
// }

// We'll handle auth providers in the login screen component
export { app, db, auth };

// To satisfy expo-router needing a default export
export default { app, db, auth };