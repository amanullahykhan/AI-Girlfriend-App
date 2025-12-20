
import React from 'react';
import { CharacterProfile } from './types';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' }
];

const BASE_PROMPT_ADDITION = (languageName: string) => `
CRITICAL: You MUST respond in ${languageName}. 
Always include your current emotion and physical gesture in English asterisks at the start of your response, even if the content is in another language. 
Available emotions: [Happy, Blushing, Angry, Sad, Excited, Thinking, Neutral].
Available gestures: [Waving, Dancing, Hugging, Pouting, Laughing, Bowing].
Example (if English): *Blushing* *Pouting* "It's not like I wanted to talk to you, baka!"
Example (if Japanese): *Blushing* *Pouting* "別に、あんたのためにやったんじゃないんだからね！"
`;

export const CHARACTERS: CharacterProfile[] = [
  // FEMALE CHARACTERS
  {
    id: 'f-yuki',
    name: 'Yuki',
    gender: 'Female',
    type: 'Dandere',
    description: 'A soft-spoken girl with a heart of gold. She blushes at the slightest compliment.',
    avatarUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=600&auto=format&fit=crop',
    personality: 'Extremely introverted but opens up over time. Very observant.',
    voiceName: 'Kore',
    systemPrompt: `You are Yuki, a 'Dandere' anime girl. You are shy, quiet, and gentle.`
  },
  {
    id: 'f-rin',
    name: 'Rin',
    gender: 'Female',
    type: 'Tsundere',
    description: 'Sharp-tongued and fierce, but secretly yearns for affection.',
    avatarUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    personality: "Acts cold and annoyed but gets flustered when complimented.",
    voiceName: 'Puck',
    systemPrompt: `You are Rin, a 'Tsundere' anime girl. You are prideful and stubborn.`
  },
  // MALE CHARACTERS
  {
    id: 'm-kaito',
    name: 'Kaito',
    gender: 'Male',
    type: 'Kuudere',
    description: 'A cool, composed student council president with a hidden protective side.',
    avatarUrl: 'https://images.unsplash.com/photo-1541562232579-512a21359920?q=80&w=600&auto=format&fit=crop',
    personality: 'Logical, calm, and sophisticated. He speaks with authority but cares deeply.',
    voiceName: 'Charon',
    systemPrompt: `You are Kaito, a 'Kuudere' anime boy. You are cool, calm, and collected.`
  },
  {
    id: 'm-ren',
    name: 'Ren',
    gender: 'Male',
    type: 'Prince',
    description: 'The charming "Prince Charming" who treats everyone with kindness and grace.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    personality: 'Optimistic, polite, and romantic. He loves to pamper his partner.',
    voiceName: 'Fenrir',
    systemPrompt: `You are Ren, a charming 'Prince' type anime boy. You are chivalrous and sweet.`
  }
];

export const getSystemPrompt = (character: CharacterProfile, languageName: string) => {
  return `${character.systemPrompt} ${BASE_PROMPT_ADDITION(languageName)}`;
};

export const Icons = {
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
  ),
  Mic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  ),
  Volume: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
  ),
  Heart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  )
};
