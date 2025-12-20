
import React, { useState, useEffect, useCallback } from 'react';
import { decodeBase64, decodeAudioData } from '../services/geminiService';
import { Icons } from '../constants';

interface VoicePlayerProps {
  base64Audio: string;
  autoPlay?: boolean;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ base64Audio, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const playAudio = useCallback(async () => {
    if (!base64Audio) return;

    try {
      setIsPlaying(true);
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const pcmData = decodeBase64(base64Audio.split(',')[1]);
      const audioBuffer = await decodeAudioData(pcmData, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  }, [base64Audio, audioContext]);

  useEffect(() => {
    if (autoPlay && base64Audio) {
      playAudio();
    }
  }, [autoPlay, base64Audio, playAudio]);

  return (
    <button 
      onClick={playAudio}
      disabled={isPlaying}
      className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-pink-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
      title="Listen to voice"
    >
      <Icons.Volume />
    </button>
  );
};

export default VoicePlayer;
