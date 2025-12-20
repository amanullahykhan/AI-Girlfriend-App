
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * 🛠️ ACTION REQUIRED: PASTE THESE RULES IN FIREBASE CONSOLE
 * 1. Go to: https://console.firebase.google.com/
 * 2. Select Project > Firestore Database > Rules tab
 * 3. Paste the following:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     match /chats/{chatId} {
 *       allow read, write: if request.auth != null && chatId.startsWith(request.auth.uid);
 *     }
 *   }
 * }
 */

const firebaseConfig = {
  apiKey: "AIzaSyDf71xE-ad2KuKcSMl0wtdAdKqkAKZqbBU",
  authDomain: "multichat-pro-1fb54.firebaseapp.com",
  projectId: "multichat-pro-1fb54",
  storageBucket: "multichat-pro-1fb54.firebasestorage.app",
  messagingSenderId: "967204189620",
  appId: "1:967204189620:web:c790b0c8ee3f6608a2eee1",
  measurementId: "G-DPCNLNEM4J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const isPermissionError = (error: any) => {
  return error?.code === 'permission-denied' || error?.message?.includes('permissions');
};
