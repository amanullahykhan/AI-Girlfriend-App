
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db, isPermissionError } from './firebase';
import { User, Message, Gender } from '../types';

let useFallback = false;

const logPermissionError = () => {
  console.warn(
    "AISURU NOTICE: Firestore permissions are missing. Switching to Local Storage Fallback for this session.\n" +
    "To fix permanently: Go to Firebase Console > Firestore > Rules and apply the rules found in services/firebase.ts"
  );
  useFallback = true;
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          // Fallback check if user exists in local storage but not DB
          const localUser = localStorage.getItem(`user_${fbUser.uid}`);
          callback(localUser ? JSON.parse(localUser) : null);
        }
      } catch (err: any) {
        if (isPermissionError(err)) logPermissionError();
        const localUser = localStorage.getItem(`user_${fbUser.uid}`);
        callback(localUser ? JSON.parse(localUser) : null);
      }
    } else {
      callback(null);
    }
  });
};

export const signUpUser = async (email: string, pass: string, name: string, gender: Gender, language: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = userCredential.user;
  
  const userData: User = {
    id: fbUser.uid,
    email: email,
    displayName: name,
    gender: gender,
    preference: gender === 'Male' ? 'Female' : 'Male',
    language: language,
    selectedCharacterId: ''
  };

  try {
    await setDoc(doc(db, "users", fbUser.uid), userData);
  } catch (err: any) {
    if (isPermissionError(err)) {
      logPermissionError();
      localStorage.setItem(`user_${fbUser.uid}`, JSON.stringify(userData));
    } else {
      throw err;
    }
  }
  return userData;
};

export const loginUser = async (email: string, pass: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  try {
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (userDoc.exists()) return userDoc.data() as User;
    
    const localUser = localStorage.getItem(`user_${userCredential.user.uid}`);
    if (localUser) return JSON.parse(localUser);
    
    throw new Error("User profile not found. Please sign up again.");
  } catch (err: any) {
    if (isPermissionError(err)) {
      logPermissionError();
      const localUser = localStorage.getItem(`user_${userCredential.user.uid}`);
      if (localUser) return JSON.parse(localUser);
    }
    throw err;
  }
};

export const updateUserProfile = async (user: User) => {
  if (!auth.currentUser || auth.currentUser.uid !== user.id) return;
  
  localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  if (useFallback) return;

  try {
    await setDoc(doc(db, "users", user.id), user, { merge: true });
  } catch (err: any) {
    if (isPermissionError(err)) logPermissionError();
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getChatHistory = async (userId: string, characterId: string): Promise<Message[]> => {
  const localKey = `chat_${userId}_${characterId}`;
  
  try {
    if (!useFallback && auth.currentUser?.uid === userId) {
      const chatDoc = await getDoc(doc(db, "chats", `${userId}_${characterId}`));
      if (chatDoc.exists()) {
        const history = chatDoc.data().messages || [];
        localStorage.setItem(localKey, JSON.stringify(history));
        return history;
      }
    }
  } catch (err: any) {
    if (isPermissionError(err)) logPermissionError();
  }

  const localHistory = localStorage.getItem(localKey);
  return localHistory ? JSON.parse(localHistory) : [];
};

export const saveChatHistory = async (userId: string, characterId: string, language: string, messages: Message[]) => {
  const localKey = `chat_${userId}_${characterId}`;
  localStorage.setItem(localKey, JSON.stringify(messages));

  if (useFallback || !auth.currentUser || auth.currentUser.uid !== userId) return;

  try {
    const chatRef = doc(db, "chats", `${userId}_${characterId}`);
    await setDoc(chatRef, {
      userId,
      characterId,
      language,
      messages,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  } catch (err: any) {
    if (isPermissionError(err)) logPermissionError();
  }
};
