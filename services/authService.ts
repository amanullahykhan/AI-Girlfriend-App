
import { User, ChatHistory, Message } from '../types';

// Mocking persistent storage using localStorage for the demo
const STORAGE_KEY_USER = 'aisuru_user';
const STORAGE_KEY_CHATS = 'aisuru_chats';

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getChatHistory = (userId: string, characterId: string): Message[] => {
  const allChats = localStorage.getItem(STORAGE_KEY_CHATS);
  if (!allChats) return [];
  const parsed: ChatHistory[] = JSON.parse(allChats);
  const session = parsed.find(c => c.userId === userId && c.characterId === characterId);
  return session ? session.messages : [];
};

// Fix: Added language parameter to ensure stored ChatHistory objects contain the required property.
export const saveChatHistory = (userId: string, characterId: string, language: string, messages: Message[]) => {
  const allChatsRaw = localStorage.getItem(STORAGE_KEY_CHATS);
  let allChats: ChatHistory[] = allChatsRaw ? JSON.parse(allChatsRaw) : [];
  
  const index = allChats.findIndex(c => c.userId === userId && c.characterId === characterId);
  if (index >= 0) {
    allChats[index].messages = messages;
    allChats[index].language = language;
  } else {
    // Fix: Added the 'language' property when pushing a new ChatHistory object to resolve the TypeScript error.
    allChats.push({ userId, characterId, language, messages });
  }
  
  localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(allChats));
};
