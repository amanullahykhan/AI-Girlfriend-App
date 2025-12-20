
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
  apiKey: "AIzaSyDf71xE-YOUR-API",
  authDomain: "YOUR-FIREBASE-DOMAIN.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-SOTRAGE.firebasestorage.app",
  messagingSenderId: "xxxxxxxx",
  appId: "x:xxxxxxx,x-xxxxxxxx",
  measurementId: "G-DPCNLNEM4J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const isPermissionError = (error: any) => {
  return error?.code === 'permission-denied' || error?.message?.includes('permissions');
};
