
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Lock, Unlock, Clock, PlayCircle, Shield, 
  Plus, Calendar, Info, ChevronRight, History, 
  Hourglass, Gift, EyeOff, X, Pause, User, Sparkles, Share2, Heart
} from 'lucide-react';
import { LegacyItem } from '../types/app';

interface ExtendedLegacyItem extends LegacyItem {
  recipient?: string;
  enshrinedMessage?: string;
  category?: 'Wisdom' | 'Secret' | 'Asset' | 'Blessing';
}

const INITIAL_LEGACY_DATA: ExtendedLegacyItem[] = [
  { 
    id: '1', 
    title: 'A Message for your 21st', 
    lockedUntil: 'Dec 12, 2028', 
    from: 'Grandma Ruth', 
    recipient: 'Current Generation',
    isUnlocked: false, 
    thumbnail: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20',
    category: 'Wisdom'
  },
  { 
    id: '2', 
    title: 'The Secret Ingredient', 
    lockedUntil: 'Jan 01, 2024', 
    from: 'Great Aunt May', 
    isUnlocked: true, 
    enshrinedMessage: "The secret to the Shtepy Saffron Cake isn't the spice itself, but the three hours of cold-press preparation before the sun rises. Patience is the first ingredient.",
    thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    category: 'Secret'
  },
  { 
    id: '3', 
    title: 'Family Creed (1890)', 
    lockedUntil: 'Jun 15, 2025', 
    from: 'Ancestors', 
    isUnlocked: false, 
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    category: 'Blessing'
  },
  { 
    id: '4', 
    title: 'Wedding Wishes', 
    lockedUntil: 'Sep 20, 2024', 
    from: 'Arthur Shtepy', 
    isUnlocked: true, 
    enshrinedMessage: "Arthur wished for a union as precise as his finest watch—where two separate gears move in perfect, silent harmony to tell a single story.",
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    category: 'Asset'
  },
];

const LegacyScreen: React.FC = () => {
  const [legacyData, setLegacyData] = useState<ExtendedLegacyItem[]>(INITIAL_LEGACY_DATA);
  const [activeCapsule, setActiveCapsule] = useState<ExtendedLegacyItem | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newCategory, setNewCategory] = useState<ExtendedLegacyItem['category']>('Wisdom');
  const [isSealing, setIsSealing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlayMessage = async (item: ExtendedLegacyItem) => {
    if (isNarrating) {
      sourceNodeRef.current?.stop();
      setIsNarrating(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Read this family legacy message from ${item.from}. 
      Message: "${item.enshrinedMessage || "This is a sacred memory intended for the chosen recipient."}"
      Tone: Deep, prestigious, echoing through time. Start with "An echo from the past, unveiled for you."`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsNarrating(false);
        sourceNodeRef.current = source;
        source.start();
        setIsNarrating(true);
      }
    } catch (error) {
      console.error("Audio failure:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSeal = async () => {
    if (!newTitle.trim()) return;
    setIsSealing(true);
    
    try {
      // Use Gemini to "Enshrine" the title into a proper message
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Write a 2-sentence mysterious and beautiful family legacy message based on this title: "${newTitle}" for ${newRecipient || 'Future Generations'}.`;
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      
      const newItem: ExtendedLegacyItem = {
        id: Date.now().toString(),
        title: newTitle,
        recipient: newRecipient || 'Future Generations',
        lockedUntil: 'Jan 01, 2030',
        from: 'You',
        isUnlocked: false,
        enshrinedMessage: response.text,
        thumbnail: `https://images.unsplash.com/photo-1533227268408-a774695d9ae9?auto=format&fit=crop&q=80`,
        category: newCategory
      };

      setLegacyData([newItem, ...legacyData]);
      setNewTitle("");
      setNewRecipient("");
      setShowCreator(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSealing(false);
    }
  };

  const unlockedItems = legacyData.filter(i => i.isUnlocked);
  const lockedItems = legacyData.filter(i => !i.isUnlocked);

  return (
    <div className="scroll-page px-6 relative bg-[#1A1918] no-scrollbar">
      <header className="mb-12 pt-16 flex justify-between items-end">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Legacy Mode</h1>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-yellow-500" strokeWidth={STROKE_WIDTH} />
            <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
              Time Encapsulated Stories
            </p>
          </div>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreator(true)}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group shadow-[0_0_20px_rgba(108,69,149,0.2)]"
        >
          <Plus size={20} className="group-hover:text-purple-400" strokeWidth={STROKE_WIDTH} />
        </motion.button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-3xl p-5 border border-white/5 relative overflow-hidden group"
        >
            <History size={40} className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" strokeWidth={STROKE_WIDTH} />
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Unveiled Echoes</p>
            <p className="text-2xl font-bold">{unlockedItems.length}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-3xl p-5 border border-white/5 relative overflow-hidden group"
        >
            <Hourglass size={40} className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" strokeWidth={STROKE_WIDTH} />
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Sealed Promises</p>
            <p className="text-2xl font-bold text-yellow-500">{lockedItems.length}</p>
        </motion.div>
      </div>

      {/* The Unveiled Section */}
      <section className="mb-12">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 px-2 flex items-center gap-2">
          <Sparkles size={12} className="text-purple-400" /> Unveiled Artifacts
        </h3>
        <div className="flex flex-col gap-4">
          {unlockedItems.map((item, i) => (
            <motion.div 
              key={item.id} 
              layoutId={item.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => setActiveCapsule(item)}
              className="group relative h-32 rounded-3xl overflow-hidden bg-[#252329] border border-white/5 cursor-pointer shadow-xl hover:border-white/20 transition-all"
            >
              <img src={item.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-inner">
                      <Unlock size={24} className="text-teal-400" strokeWidth={STROKE_WIDTH} />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase tracking-tighter">
                            {item.category}
                         </span>
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Released by {item.from}</p>
                      </div>
                      <h4 className="text-lg font-bold tracking-tight">{item.title}</h4>
                   </div>
                </div>
                <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" strokeWidth={STROKE_WIDTH} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Waiting Vault Section */}
      <section className="pb-32">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 px-2 flex items-center gap-2">
          <Lock size={12} /> The Waiting Vault
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {lockedItems.map((item, i) => (
            <motion.div 
              key={item.id}
              layoutId={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="relative h-44 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#1A1918]/70 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-8">
                 <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(253,198,52,0.1)]"
                  >
                    <Lock size={24} className="text-yellow-500" strokeWidth={STROKE_WIDTH} />
                 </motion.div>
                 <h4 className="text-base font-bold text-white/90 mb-1">{item.title}</h4>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Clock size={10} className="text-yellow-500" strokeWidth={STROKE_WIDTH} />
                    <span className="text-[10px] font-black text-yellow-500 tracking-widest uppercase">Unseals: {item.lockedUntil}</span>
                 </div>
                 <p className="text-[9px] text-white/20 mt-3 font-bold uppercase tracking-widest">Reserved for: {item.recipient}</p>
              </div>
              <img src={item.thumbnail} className="w-full h-full object-cover opacity-20 grayscale" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capsule Creation Modal */}
      <AnimatePresence>
        {showCreator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-6"
          >
             <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowCreator(false)} />
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg bg-[#252329] rounded-[3.5rem] border border-white/10 shadow-2xl p-8 sm:p-10"
              >
                <div className="flex justify-between items-center mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Gift size={24} className="text-purple-400" strokeWidth={STROKE_WIDTH} />
                   </div>
                   <button onClick={() => setShowCreator(false)} className="text-white/20 hover:text-white">
                      <X size={24} strokeWidth={STROKE_WIDTH} />
                   </button>
                </div>

                <h2 className="text-3xl font-bold tracking-tighter mb-2">Seal a Secret</h2>
                <p className="text-sm text-white/40 mb-10">Choose a recipient and a lesson to enshrine.</p>

                <div className="space-y-6 mb-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Legacy Topic</label>
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., The Story of the Shtepy Crest" 
                        className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 px-6 outline-none focus:border-purple-500/50 transition-all text-sm font-medium" 
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Chosen Recipient</label>
                      <div className="relative">
                         <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                         <input 
                           type="text" 
                           value={newRecipient}
                           onChange={(e) => setNewRecipient(e.target.value)}
                           placeholder="Who should hear this?" 
                           className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 pl-14 pr-6 outline-none focus:border-purple-500/50 transition-all text-sm font-medium" 
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      {(['Wisdom', 'Secret', 'Asset', 'Blessing'] as const).map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setNewCategory(cat)}
                           className={`h-12 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${newCategory === cat ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-900/40' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                         >
                            {cat}
                         </button>
                      ))}
                   </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSeal}
                  disabled={isSealing || !newTitle}
                  className="w-full h-16 text-white rounded-3xl font-bold text-base flex items-center justify-center gap-3 shadow-2xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: COLORS.PRIMARY }}
                >
                   {isSealing ? (
                     <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>
                       <Shield size={20} strokeWidth={STROKE_WIDTH} />
                       Seal into History
                     </>
                   )}
                </motion.button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail/Active Capsule View */}
      <AnimatePresence>
        {activeCapsule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex flex-col"
          >
              <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
                  <motion.button 
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    onClick={() => {
                      if (isNarrating) sourceNodeRef.current?.stop();
                      setIsNarrating(false);
                      setActiveCapsule(null);
                    }} 
                    className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10"
                  >
                      <X size={20} strokeWidth={STROKE_WIDTH} />
                  </motion.button>
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Released Item</span>
                      <span className="text-xs font-bold text-teal-400 tracking-tight">ARCHIVE #{activeCapsule.id.slice(-4)}</span>
                  </motion.div>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col justify-end">
                  <motion.img 
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={activeCapsule.thumbnail} 
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-50" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative p-10 pb-20 max-w-2xl mx-auto w-full"
                  >
                      <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 rounded-full border-2 border-teal-500 p-0.5 shadow-xl">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeCapsule.from}`} className="w-full h-full rounded-full" />
                          </div>
                          <div>
                              <p className="text-xs font-bold text-white leading-none mb-1">{activeCapsule.from}</p>
                              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Memory Originator</p>
                          </div>
                      </div>

                      <div className="mb-8">
                         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2 block">Sealed Truth</span>
                         <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-6 leading-[0.9]">{activeCapsule.title}</h2>
                         <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
                            <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-medium italic">
                              "{activeCapsule.enshrinedMessage || "This wisdom was held in silence for the proper moment."}"
                            </p>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                         <motion.button 
                           whileTap={{ scale: 0.95 }}
                           onClick={() => handlePlayMessage(activeCapsule)}
                           className={`flex-1 h-16 rounded-[2rem] text-white font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(108,69,149,0.3)] transition-all ${isNarrating ? 'bg-purple-700' : ''}`}
                           style={{ backgroundColor: isNarrating ? undefined : COLORS.PRIMARY }}
                         >
                             {isLoadingAudio ? (
                               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                             ) : isNarrating ? (
                               <Pause size={24} fill="white" strokeWidth={STROKE_WIDTH} />
                             ) : (
                               <PlayCircle size={24} fill="white" strokeWidth={STROKE_WIDTH} />
                             )}
                             {isNarrating ? 'Pause Echo' : 'Echo Narrative'}
                         </motion.button>
                         <div className="flex gap-4">
                            <button className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                               <Heart size={24} strokeWidth={STROKE_WIDTH} />
                            </button>
                            <button className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                               <Share2 size={24} strokeWidth={STROKE_WIDTH} />
                            </button>
                         </div>
                      </div>
                  </motion.div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LegacyScreen;
