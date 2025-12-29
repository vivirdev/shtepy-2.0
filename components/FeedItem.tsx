
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, MoreVertical, Volume2, Pause, Play, Share2 } from 'lucide-react';
import { Memory } from '../types/app';
import { GoogleGenAI, Modality } from "@google/genai";
import { COLORS, STROKE_WIDTH } from '../constants/Theme';

interface FeedItemProps {
  memory: Memory;
  onCommentClick: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ memory, onCommentClick }) => {
  const [liked, setLiked] = useState(false);
  const [showHeartPulse, setShowHeartPulse] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const lastTap = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleNarrate = async () => {
    if (isNarrating) {
      sourceNodeRef.current?.stop();
      setIsNarrating(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Tell this story with a warm, prestigious family legacy tone: "${memory.title}". This memory belongs to ${memory.author} and was captured in ${memory.date}. Mention the importance of preserving this for the Shtepy lineage.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
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
      console.error(error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) setLiked(true);
      setShowHeartPulse(true);
      setTimeout(() => setShowHeartPulse(false), 800);
    }
    lastTap.current = now;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: memory.title, text: `Shtepy Legacy: ${memory.title}`, url: window.location.href });
    }
  };

  return (
    <div className="snap-item relative h-full w-full overflow-hidden" onClick={handleDoubleTap}>
      <motion.img 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.75 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src={memory.url} 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

      {/* Action Sidebar - Responsively positioned */}
      <div className="absolute right-4 sm:right-6 bottom-36 sm:bottom-48 z-20 flex flex-col gap-5 sm:gap-7 items-center">
        <div className="flex flex-col items-center gap-1.5">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className={`p-3.5 sm:p-4.5 rounded-[1.5rem] border transition-all ${liked ? 'bg-red-500 border-red-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/60'}`}
          >
            <Heart size={22} sm:size={26} fill={liked ? "currentColor" : "none"} strokeWidth={STROKE_WIDTH} />
          </motion.button>
          <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">{memory.likes + (liked ? 1 : 0)}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={(e) => { e.stopPropagation(); onCommentClick(); }}
            className="p-3.5 sm:p-4.5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white/60 active:scale-95"
          >
            <MessageCircle size={22} sm:size={26} strokeWidth={STROKE_WIDTH} />
          </motion.button>
          <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">{memory.comments}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={handleShare}
            className="p-3.5 sm:p-4.5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white/60 active:scale-95"
          >
            <Share2 size={22} sm:size={26} strokeWidth={STROKE_WIDTH} />
          </motion.button>
          <span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">Send</span>
        </div>

        <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }} className="p-3.5 sm:p-4.5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white/30">
          <MoreVertical size={22} sm:size={26} strokeWidth={STROKE_WIDTH} />
        </button>
      </div>

      {/* Main Info Overlay - Fluid spacing */}
      <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-36 sm:pb-48 pointer-events-none">
        <div className="max-w-[80%] flex flex-col items-start pointer-events-auto">
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-teal-400/30 p-0.5 bg-black/40 backdrop-blur-md">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memory.author}`} className="w-full h-full rounded-[0.5rem] object-cover" />
            </div>
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-white tracking-tight">{memory.author}</h4>
              <p className="text-[8px] sm:text-[9px] text-teal-400 font-black uppercase tracking-widest opacity-80">{memory.authorRole}</p>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-bold tracking-tighter mb-4 text-white leading-tight drop-shadow-lg"
          >
            {memory.title}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2.5 text-white/40 text-[9px] sm:text-[10px] mb-8"
          >
            <span className="font-bold tracking-widest uppercase">{memory.date}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="uppercase tracking-widest font-black opacity-60">SHTEPY ARCHIVE</span>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleNarrate(); }}
            className={`flex items-center gap-3 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl backdrop-blur-3xl border shadow-xl transition-all ${isNarrating ? 'bg-purple-500/30 border-purple-400 text-purple-200' : 'bg-white/10 border-white/20 text-white'}`}
          >
            {isLoadingAudio ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isNarrating ? <Pause size={16} fill="currentColor" /> : <Volume2 size={16} />)}
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Echo narrative</span>
          </motion.button>
        </div>
      </div>

      {/* Double Tap Heart */}
      <AnimatePresence>
        {showHeartPulse && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <Heart size={100} fill={COLORS.PREMIUM} color={COLORS.PREMIUM} className="drop-shadow-[0_0_30px_rgba(253,198,52,0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedItem;
