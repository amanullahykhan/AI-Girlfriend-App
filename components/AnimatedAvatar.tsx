
import React, { useState, useEffect, useMemo } from 'react';

interface AnimatedAvatarProps {
  avatarUrl: string;
  emotion?: string;
  gesture?: string;
  isTyping?: boolean;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ avatarUrl, emotion, gesture, isTyping }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    }, 3500);

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position relative to center
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(blinkInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 5}s`,
      size: `${2 + Math.random() * 4}px`
    }));
  }, []);

  const getGestureStyles = () => {
    switch (gesture?.toLowerCase()) {
      case 'dancing': return { animation: 'anime-dance 2s infinite ease-in-out' };
      case 'waving': return { animation: 'anime-wave 1s infinite' };
      case 'bowing': return { transform: 'rotate(5deg) translateY(10px)', transition: 'transform 0.5s' };
      case 'hugging': return { transform: 'scale(1.1)', transition: 'transform 0.5s' };
      case 'pouting': return { transform: 'scale(0.98) rotate(-2deg)', transition: 'transform 0.3s' };
      default: return {};
    }
  };

  const eyeParallax = {
    transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 3}px)`
  };

  const headParallax = {
    transform: `rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 8}deg)`
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden perspective-1000">
      {/* Environmental Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute bg-white/20 rounded-full animate-float-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* Dynamic Background Aura */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        emotion === 'Angry' ? 'bg-red-500/5' : 
        emotion === 'Blushing' ? 'bg-pink-500/10' : 
        emotion === 'Happy' ? 'bg-yellow-500/5' : 'bg-transparent'
      }`} />
      
      {/* Main Character Body */}
      <div 
        className={`relative z-10 transition-all duration-700 ease-out flex flex-col items-center animate-anime-breathe`}
        style={{ ...getGestureStyles(), ...headParallax }}
      >
        {/* Shadow */}
        <div className="absolute -bottom-4 w-48 h-4 bg-black/20 blur-xl rounded-full" />

        {/* The "Living" Portrait */}
        <div className="relative group">
          {/* Emotion Aura Glow */}
          <div className={`absolute inset-[-20px] rounded-full blur-3xl opacity-40 animate-pulse transition-colors ${
            emotion === 'Angry' ? 'bg-red-600' : 
            emotion === 'Blushing' ? 'bg-pink-400' : 
            emotion === 'Excited' ? 'bg-yellow-300' : 'bg-blue-400/30'
          }`} />

          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
            <img 
              src={avatarUrl} 
              alt="Anime Companion" 
              className={`w-full h-full object-cover transition-transform duration-1000 ${isTyping ? 'scale-110 contrast-110' : 'scale-100'}`}
            />

            {/* Simulated Eye Blink & Follow */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
              <div className="relative w-full h-full" style={eyeParallax}>
                {isBlinking && (
                  <>
                    <div className="absolute top-0 left-[22%] w-[18%] h-[6px] bg-[#221c1c] rounded-full blur-[1px]" />
                    <div className="absolute top-0 right-[22%] w-[18%] h-[6px] bg-[#221c1c] rounded-full blur-[1px]" />
                  </>
                )}
              </div>
            </div>

            {/* Blush Effect Overlay */}
            {emotion === 'Blushing' && (
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex space-x-12 opacity-60">
                <div className="w-8 h-4 bg-pink-500/40 blur-md rounded-full" />
                <div className="w-8 h-4 bg-pink-500/40 blur-md rounded-full" />
              </div>
            )}
          </div>
          
          {/* Thinking Bubbles */}
          {isTyping && (
            <div className="absolute -top-8 -right-8 flex space-x-1">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Interactive Emotion/Gesture Badges */}
        <div className="mt-8 flex gap-3">
          {emotion && (
            <div className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-pink-400 uppercase tracking-widest shadow-xl">
              Mood: {emotion}
            </div>
          )}
          {gesture && (
            <div className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest shadow-xl">
              Action: {gesture}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        
        @keyframes anime-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }

        @keyframes anime-dance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          75% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes anime-wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }

        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0) opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px) opacity: 0; }
        }

        .animate-float-particle {
          animation: float-particle linear infinite;
        }

        .animate-anime-breathe {
          animation: anime-breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedAvatar;
