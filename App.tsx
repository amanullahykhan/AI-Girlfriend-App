
import React, { useState, useEffect, useRef } from 'react';
import { User, CharacterProfile, Message } from './types';
import { CHARACTERS, Icons } from './constants';
import { getCurrentUser, saveUser, clearAuth, getChatHistory, saveChatHistory } from './services/authService';
import { generateAiResponse, generateSpeech } from './services/geminiService';
import VoicePlayer from './components/VoicePlayer';

// --- Auth Component ---
const AuthScreen: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      displayName: isLogin ? email.split('@')[0] : name,
      selectedCharacterId: ''
    };
    saveUser(newUser);
    onAuth(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      
      <div className="anime-card p-8 rounded-3xl w-full max-w-md shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-brand text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-2">Aisuru</h1>
          <p className="text-slate-400">Find your perfect anime companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
                placeholder="How should I call you?"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-white"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-500/20 transition-all transform hover:scale-[1.02]">
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
const CharacterSelect: React.FC<{ onSelect: (char: CharacterProfile) => void }> = ({ onSelect }) => {
  return (
    <div className="min-h-screen p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h2 className="text-4xl font-bold font-brand mb-4">Choose Your Companion</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Select a character that resonates with your personality. Each has a unique heart, voice, and way of looking at the world.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CHARACTERS.map(char => (
            <div key={char.id} className="anime-card group rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all cursor-pointer flex flex-col" onClick={() => onSelect(char)}>
              <div className="relative h-64 overflow-hidden">
                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 bg-pink-500 text-xs font-bold rounded-full uppercase tracking-widest">{char.type}</span>
                  <h3 className="text-3xl font-bold mt-2 font-brand">{char.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{char.description}</p>
                <div className="flex items-center text-xs text-slate-500 space-x-4">
                  <div className="flex items-center"><Icons.Heart /><span className="ml-1">Relationship Ready</span></div>
                  <div className="flex items-center"><Icons.Volume /><span className="ml-1">Voice Enabled</span></div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button className="w-full bg-slate-800 group-hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition-colors">Connect with {char.name}</button>
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

  useEffect(() => {
    const history = getChatHistory(user.id, character.id);
    setMessages(history.length > 0 ? history : []);
  }, [user.id, character.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      saveChatHistory(user.id, character.id, messages);
    }
  }, [messages, user.id, character.id]);

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
      const aiResponse = await generateAiResponse(
        inputText,
        messages.slice(-10), // Context window
        character,
        userMessage.imageUrl
      );

      const voiceData = await generateSpeech(aiResponse || "", character.voiceName);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponse || "...",
        timestamp: Date.now(),
        audioUrl: voiceData
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Speech to Text (Web Speech API)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/50 hidden lg:flex flex-col">
        <div className="p-6 border-bottom border-slate-800">
          <h1 className="text-2xl font-bold font-brand text-pink-500">Aisuru</h1>
        </div>
        <div className="p-6 flex flex-col items-center text-center flex-grow">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500/30 mb-4 shadow-xl shadow-pink-500/10">
            <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold mb-1">{character.name}</h2>
          <span className="text-xs text-pink-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-pink-500/10 rounded-full mb-4">{character.type}</span>
          <p className="text-sm text-slate-400 mb-6 italic">"{character.personality}"</p>
          
          <div className="w-full bg-slate-800/50 rounded-2xl p-4 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Companion Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Affection</span>
                <span className="text-pink-400">Level 5</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full">
                <div className="bg-pink-500 h-full rounded-full w-[65%]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-800">
          <button onClick={onLogout} className="w-full py-2 text-sm text-slate-500 hover:text-white transition-colors">Switch Character / Logout</button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-grow flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center">
            <div className="lg:hidden w-8 h-8 rounded-full overflow-hidden mr-3">
              <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold">{character.name}</h3>
              <div className="flex items-center text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                ACTIVE NOW
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="p-2 text-slate-400 hover:text-white"><Icons.Heart /></button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-20 h-20 bg-pink-500/5 rounded-full flex items-center justify-center mb-4">
                <Icons.Heart />
              </div>
              <p>Start a conversation with {character.name}.<br/>Tell her about your day!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'bg-indigo-600 rounded-2xl rounded-tr-none' : 'anime-card rounded-2xl rounded-tl-none'} p-4 shadow-lg`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached" className="rounded-lg mb-3 max-h-60 w-full object-cover border border-white/10" />
                )}
                <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-[10px] opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   {msg.role === 'model' && msg.audioUrl && (
                     <VoicePlayer base64Audio={msg.audioUrl} autoPlay={msg.id === messages[messages.length - 1].id} />
                   )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="anime-card rounded-2xl rounded-tl-none p-4 flex space-x-1 items-center">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
          {selectedImage && (
            <div className="mb-4 relative inline-block">
              <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-pink-500" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-1 text-white shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}
          <div className="flex items-end space-x-3">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all">
              <Icons.Image />
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </button>
            <button onClick={startListening} className="p-3 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all">
              <Icons.Mic />
            </button>
            <div className="flex-grow relative">
              <textarea 
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder={`Talk to ${character.name}...`}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none max-h-32"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() && !selectedImage}
              className="p-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-500/20 transition-all transform active:scale-95"
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Main App Controller ---
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

  const handleAuth = (u: User) => {
    setUser(u);
  };

  const handleCharSelect = (char: CharacterProfile) => {
    if (user) {
      const updatedUser = { ...user, selectedCharacterId: char.id };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
    setSelectedCharacter(char);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setSelectedCharacter(null);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-pink-500 font-brand text-2xl animate-pulse">Aisuru...</div>;

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!selectedCharacter) {
    return <CharacterSelect onSelect={handleCharSelect} />;
  }

  return (
    <ChatScreen user={user} character={selectedCharacter} onLogout={handleLogout} />
  );
}
