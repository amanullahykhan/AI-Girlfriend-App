
export type CharacterType = 'Tsundere' | 'Dandere' | 'Genki' | 'Kuudere';

export interface User {
  id: string;
  email: string;
  displayName: string;
  selectedCharacterId: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  type: CharacterType;
  description: string;
  avatarUrl: string;
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
}

export interface ChatHistory {
  userId: string;
  characterId: string;
  messages: Message[];
}
