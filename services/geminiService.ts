import { GoogleGenAI, Modality } from "@google/genai";
import { Message, CharacterProfile } from "../types";

export const generateAiResponse = async (
  prompt: string,
  history: Message[],
  character: CharacterProfile,
  imageBase64?: string
) => {
  // Use the required initialization format.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = "gemini-3-flash-preview";

  // Prepare history parts for the conversation.
  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content || "..." }]
  }));

  // Add the latest user message with optional image.
  const currentParts: any[] = [{ text: prompt || "Hello!" }];
  if (imageBase64) {
    const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    currentParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
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

  // Extract text directly using the getter.
  return response.text || "";
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Clean text of emote markers (asterisks) for speech clarity.
  const cleanText = text.replace(/\*.*?\*/g, '').replace(/\[.*?\]/g, '').trim();
  if (!cleanText) return "";
  
  try {
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

    const parts = response.candidates?.[0]?.content?.parts;
    const audioPart = parts?.find(p => p.inlineData);
    const base64Audio = audioPart?.inlineData?.data;
    
    return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : "";
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return "";
  }
};

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
  // Gemini TTS returns 16-bit PCM.
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
