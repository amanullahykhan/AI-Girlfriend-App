
export type CharacterType = 'Tsundere' | 'Dandere' | 'Genki' | 'Kuudere' | 'Prince' | 'BadBoy' | 'Flirt';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: string;
  email: string;
  displayName: string;
  gender: Gender;
  preference: Gender;
  language: string;
  selectedCharacterId: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  gender: Gender;
  type: CharacterType;
  description: string;
  avatarUrl: string; // Base image
  videoUrl?: string; // Optional looping animation
  personality: string;
  systemPrompt: string;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  imageUrl?: string;
  audioUrl?: string;
  emotion?: string; // Parsed from AI response
  gesture?: string; // Parsed from AI response
}

export interface ChatHistory {
  userId: string;
  characterId: string;
  language: string;
  messages: Message[];
}
