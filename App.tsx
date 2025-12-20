
import React, { useState, useEffect, useRef } from 'react';
import { User, CharacterProfile, Message, Gender } from './types';
import { CHARACTERS, Icons, LANGUAGES } from './constants';
import { getCurrentUser, saveUser, clearAuth, getChatHistory, saveChatHistory } from './services/authService';
import { generateAiResponse, generateSpeech } from './services/geminiService';
import VoicePlayer from './components/VoicePlayer';
import AnimatedAvatar from './components/AnimatedAvatar';

// --- Auth Component ---
const AuthScreen: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [language, setLanguage] = useState('en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      displayName: isLogin ? email.split('@')[0] : name,
      gender: gender,
      preference: gender === 'Male' ? 'Female' : 'Male',
      language: language,
      selectedCharacterId: ''
    };
    saveUser(newUser);
    onAuth(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      
      <div className="anime-card p-8 rounded-3xl w-full max-w-md shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold font-brand text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-2">Aisuru</h1>
          <p className="text-slate-400">Your Living Anime Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
                  placeholder="How should I call you?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Language</label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white appearance-none"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code} className="bg-slate-900">{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as Gender[]).map(g => (
                    <button
                      key={g} type="button" onClick={() => setGender(g)}
                      className={`py-2 rounded-xl border text-sm transition-all ${gender === g ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <input 
              type="password" required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all transform hover:scale-[1.02] mt-4">
            {isLogin ? 'Enter Aisuru' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsLogin(!isLogin)} className="text-pink-400 hover:text-pink-300 transition-colors">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Character Selection Component ---
const CharacterSelect: React.FC<{ preference: Gender, onSelect: (char: CharacterProfile) => void }> = ({ preference, onSelect }) => {
  const filtered = CHARACTERS.filter(c => c.gender === preference);

  return (
    <div className="min-h-screen p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h2 className="text-4xl font-bold font-brand mb-4">Choose Your Companion</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Showing {preference.toLowerCase()} companions tailored to your preference.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(char => (
            <div key={char.id} className="anime-card group rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all cursor-pointer flex flex-col shadow-2xl" onClick={() => onSelect(char)}>
              <div className="relative h-72 overflow-hidden">
                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 bg-pink-500 text-[10px] font-bold rounded-full uppercase tracking-widest">{char.type}</span>
                  <h3 className="text-3xl font-bold mt-2 font-brand">{char.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">{char.description}</p>
                <div className="flex items-center text-[10px] font-bold text-slate-500 space-x-4 uppercase">
                  <div className="flex items-center"><Icons.Heart /><span className="ml-1">Animated</span></div>
                  <div className="flex items-center"><Icons.Volume /><span className="ml-1">Multilingual</span></div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button className="w-full bg-slate-800 group-hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition-all">Connect with {char.name}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Chat Component ---
const ChatScreen: React.FC<{ user: User, character: CharacterProfile, onLogout: () => void }> = ({ user, character, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentEmotion, setCurrentEmotion] = useState<string | undefined>();
  const [currentGesture, setCurrentGesture] = useState<string | undefined>();

  const languageName = LANGUAGES.find(l => l.code === user.language)?.name || 'English';

  useEffect(() => {
    const history = getChatHistory(user.id, character.id);
    setMessages(history.length > 0 ? history : []);
  }, [user.id, character.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      // Fix: Passed user.language as an argument to saveChatHistory to match the updated signature.
      saveChatHistory(user.id, character.id, user.language, messages);
      const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
      if (lastModelMsg) {
        setCurrentEmotion(lastModelMsg.emotion);
        setCurrentGesture(lastModelMsg.gesture);
      }
    }
  }, [messages, user.id, character.id, user.language]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
      imageUrl: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const aiResponseRaw = await generateAiResponse(
        inputText,
        messages.slice(-10),
        character,
        languageName,
        userMessage.imageUrl
      );

      const emotionMatch = aiResponseRaw?.match(/\*([A-Z][a-z]+)\*/);
      const gestureMatch = aiResponseRaw?.match(/\*([A-Z][a-z]+)\*/g);
      
      const emotion = emotionMatch ? emotionMatch[1] : undefined;
      const gesture = gestureMatch && gestureMatch.length > 1 ? gestureMatch[1].replace(/\*/g, '') : undefined;
      
      const aiResponse = aiResponseRaw?.replace(/\*.*?\*/g, '').trim();

      const voiceData = await generateSpeech(aiResponse || "", character.voiceName);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponse || "...",
        timestamp: Date.now(),
        audioUrl: voiceData,
        emotion,
        gesture
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = user.language || 'en-US';
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 overflow-hidden">
      <section className="h-[45vh] lg:h-full lg:w-[40%] border-b lg:border-r border-slate-800 bg-slate-900/50 flex flex-col relative overflow-hidden">
        <AnimatedAvatar 
          avatarUrl={character.avatarUrl} 
          emotion={currentEmotion} 
          gesture={currentGesture} 
          isTyping={isTyping} 
        />
        <div className="absolute top-6 left-6 z-20">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold font-brand text-pink-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{character.name}</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{character.type}</span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{languageName}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 lg:left-6 z-20 flex flex-col items-start">
           <button onClick={onLogout} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full uppercase tracking-tighter border border-white/5 shadow-2xl">Return to Choice</button>
        </div>
      </section>

      <main className="flex-grow flex flex-col relative h-[55vh] lg:h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-10">
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between px-6 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center text-[10px] font-bold text-green-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
            LIVING CONNECTION
          </div>
          <div className="flex space-x-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             Aisuru Interface v2.5
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-slate-950/40">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-pink-500/5 flex items-center justify-center mb-4 border border-pink-500/20 animate-pulse">
                <Icons.Heart />
              </div>
              <h3 className="text-slate-300 font-brand font-bold text-xl mb-2">Speak your heart...</h3>
              <p className="text-slate-500 text-sm max-w-xs">I am here and listening in {languageName}.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600/90 shadow-indigo-500/10' : 'anime-card shadow-pink-500/5'} p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-xl border border-white/5`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="rounded-xl mb-3 max-h-56 w-full object-cover border border-white/10" />
                )}
                <p className="text-sm md:text-base leading-relaxed text-slate-100">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[10px] font-medium text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   {msg.role === 'model' && msg.audioUrl && (
                     <VoicePlayer base64Audio={msg.audioUrl} autoPlay={msg.id === messages[messages.length - 1].id} />
                   )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-2xl border-t border-slate-800">
          {selectedImage && (
            <div className="mb-4 relative inline-block group">
              <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-pink-500 shadow-lg" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-1.5 text-white shadow-lg transition-transform hover:scale-110 active:scale-90">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 max-w-5xl mx-auto">
            <div className="flex gap-1">
              <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all active:scale-90"><Icons.Image /><input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" /></button>
              <button onClick={startListening} className="p-3 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90"><Icons.Mic /></button>
            </div>
            <textarea 
              rows={1} value={inputText} onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              placeholder={`Write in ${languageName}...`}
              className="flex-grow bg-slate-800/40 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none max-h-32 shadow-inner transition-all"
            />
            <button onClick={handleSendMessage} disabled={!inputText.trim() && !selectedImage} className="p-4 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-pink-500/20 transition-all active:scale-95 flex items-center justify-center">
              <Icons.Send />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      if (u.selectedCharacterId) {
        const char = CHARACTERS.find(c => c.id === u.selectedCharacterId);
        if (char) setSelectedCharacter(char);
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuth = (u: User) => setUser(u);
  const handleCharSelect = (char: CharacterProfile) => {
    if (user) {
      const updatedUser = { ...user, selectedCharacterId: char.id };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
    setSelectedCharacter(char);
  };
  const handleLogout = () => { clearAuth(); setUser(null); setSelectedCharacter(null); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-pink-500 font-brand text-2xl animate-pulse">Aisuru...</div>;
  if (!user) return <AuthScreen onAuth={handleAuth} />;
  if (!selectedCharacter) return <CharacterSelect preference={user.preference} onSelect={handleCharSelect} />;

  return <ChatScreen user={user} character={selectedCharacter} onLogout={handleLogout} />;
}
