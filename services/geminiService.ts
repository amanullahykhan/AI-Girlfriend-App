
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, CharacterProfile } from "../types";
import { getSystemPrompt } from "../constants";

export const generateAiResponse = async (
  prompt: string,
  history: Message[],
  character: CharacterProfile,
  languageName: string,
  imageBase64?: string
) => {
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
      systemInstruction: getSystemPrompt(character, languageName),
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
    },
  });

  return response.text;
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!text || text.trim().length === 0) return "";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Strip ALL markdown and emotional markers for the TTS engine
  // This prevents the model from trying to describe the tags instead of speaking.
  const cleanText = text
    .replace(/\*.*?\*/g, '') // Remove *Emotion*
    .replace(/\[.*?\]/g, '') // Remove [Tags]
    .replace(/[#*_~`]/g, '') // Remove Markdown symbols
    .trim();

  if (!cleanText) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      // The most minimal prompt possible to avoid non-audio responses.
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

    const part = response.candidates?.[0]?.content?.parts?.[0];
    
    // Check if the response actually contains audio
    if (part?.inlineData?.data) {
      return `data:audio/pcm;base64,${part.inlineData.data}`;
    }

    // If it returns text, it failed to generate audio (often safety or prompt length)
    if (part?.text) {
      console.warn("TTS skipped: Model returned text instead of audio for:", cleanText);
    }
    
    return "";
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return "";
  }
};

export function decodeBase64(base64: string) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 decode failed:", e);
    return new Uint8Array(0);
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  
  if (frameCount === 0) return ctx.createBuffer(numChannels, 1, sampleRate);

  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
