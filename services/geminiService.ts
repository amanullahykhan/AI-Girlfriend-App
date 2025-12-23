
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, CharacterProfile } from "../types";

// Always initialize GoogleGenAI inside calling functions using process.env.API_KEY directly.

export const generateAiResponse = async (
  prompt: string,
  history: Message[],
  character: CharacterProfile,
  imageBase64?: string
) => {
  // Use strictly the required initialization format.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  const currentParts: any[] = [{ text: prompt }];
  if (imageBase64) {
    currentParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(",")[1]
      }
    });
  }

  contents.push({
    role: "user",
    parts: currentParts
  });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: character.systemPrompt,
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
    },
  });

  // Directly access the text property as per guidelines.
  return response.text;
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  // Use strictly the required initialization format.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Filter out actions in asterisks for better TTS quality
  const cleanText = text.replace(/\*.*?\*/g, '').trim();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName as any },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : "";
};

// PCM Decoding Utility
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
