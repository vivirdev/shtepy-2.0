
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedItem from '../components/FeedItem';
import { Memory } from '../types/app';
import { Calendar, X, Send, ChevronRight, Check, Sparkles, Clock, MapPin, Users, Heart, Share2 } from 'lucide-react';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';
import { GoogleGenAI } from "@google/genai";

const MOCK_MEMORIES: Memory[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    title: 'Hidden Escape: The Amalfi Coast',
    date: 'Aug 15, 1954',
    author: 'Grandma Ruth',
    authorRole: 'Keeper of Stories',
    likes: 1230,
    comments: 200
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    title: 'Collaborating on the Family Legacy',
    date: 'Jul 22, 1989',
    author: 'Marcus Shtepy',
    authorRole: 'Patriarch',
    likes: 450,
    comments: 34
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
    title: 'Ancestral Gala in London',
    date: 'Sep 10, 2012',
    author: 'Elena Shtepy',
    authorRole: 'Matriarch',
    likes: 890,
    comments: 56
  }
];

const STORIES = [
  { name: 'Grandma Ruth', active: true, color: '#4BBAB8' },
  { name: 'Marcus', active: false, color: '#6C4595' },
  { name: 'Elena', active: true, color: '#FDC634' },
  { name: 'Sara', active: false, color: '#6C4595' },
  { name: 'Arthur', active: false, color: '#FDC634' },
  { name: 'Leo', active: true, color: '#4BBAB8' }
];

const INITIAL_COMMENTS = [
  { id: 1, user: 'Sara Shtepy', text: "This brings back so many memories! I remember Grandma telling us about this exact day.", time: '2h ago' },
  { id: 2, user: 'Arthur Shtepy', text: "The quality of these old scans is remarkable. Marcus, great job archiving these.", time: '5h ago' }
];

const FeedScreen: React.FC = () => {
  const [showComments, setShowComments] = useState(false);
  const [activeStoryMember, setActiveStoryMember] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [showMilestoneDetail, setShowMilestoneDetail] = useState(false);

  const [heritageInsight, setHeritageInsight] = useState<string | null>(null);

  useEffect(() => {
    fetchHeritageInsight();
  }, []);

  const fetchHeritageInsight = async () => {
    // Safety check for API key to prevent black screen/crash on Vercel if missing
    if (!process.env.API_KEY) {
      setHeritageInsight("On this day in 1924, the Shtepy heritage was formally enshrined in the archives of Bavaria.");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "Generate a one-sentence high-end 'On This Day' family heritage fact for a fictional luxury lineage called the 'Shtepy' family. Focus on elegance, tradition, or a major historical event in the year 1924.";
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setHeritageInsight(response.text);
    } catch (e) {
      setHeritageInsight("In 1924, the first Shtepy Guild meeting was held in the halls of Munich.");
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: 'You',
      text: commentText,
      time: 'Just now'
    };
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Top Overlays - Safe area and Notch management */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 pointer-events-none" style={{ paddingTop: 'calc(var(--safe-top) + 1rem)' }}>

        {/* Centered Logo */}
        <div className="flex justify-center mb-6">
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            src="/assets/logo.png"
            alt="Shtepy Logo"
            className="h-6 sm:h-8 w-auto object-contain opacity-80"
          />
        </div>

        {/* Story Bar */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-4 pointer-events-auto">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 active:scale-95 transition-transform cursor-pointer">
              <span className="text-xl font-light text-white/40">+</span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-widest">Post</span>
          </div>
          {STORIES.map((story) => (
            <motion.div
              key={story.name}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveStoryMember(story.name)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: story.active ? story.color : 'rgba(255,255,255,0.1)' }}
                  animate={story.active ? { rotate: 360 } : {}}
                  transition={story.active ? { repeat: Infinity, duration: 10, ease: "linear" } : {}}
                />
                <div className="absolute inset-1 rounded-full overflow-hidden bg-zinc-900 border border-black">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.name}`} alt={story.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${story.active ? 'text-white' : 'text-white/40'}`}>
                {story.name.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* REFACTORED: AI Heritage Widget - Fully Responsive & Non-Clipping */}
        <AnimatePresence>
          {heritageInsight && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 pointer-events-auto w-full max-w-[calc(100vw-2rem)] sm:max-w-xl"
            >
              <div className="flex items-start gap-3 p-3.5 sm:p-4.5 bg-gradient-to-br from-purple-950/60 to-black/40 border border-purple-500/30 rounded-2xl sm:rounded-3xl backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative overflow-hidden">
                {/* Luxury Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] pointer-events-none" />

                <div className="shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-400/30 shadow-inner">
                    <Sparkles size={14} className="text-purple-300" />
                  </div>
                </div>

                <div className="flex-1 pr-6 overflow-hidden">
                  <p className="text-[10.5px] sm:text-[12px] font-medium text-purple-100/90 italic leading-relaxed break-words">
                    {heritageInsight}
                  </p>
                  <div className="mt-1 flex items-center gap-2 opacity-30">
                    <div className="h-[1px] w-4 bg-purple-400" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-purple-400">On this day</span>
                  </div>
                </div>

                <button
                  onClick={() => setHeritageInsight(null)}
                  className="absolute top-2.5 right-2.5 p-1.5 text-white/20 hover:text-white/60 transition-colors rounded-full hover:bg-white/5 active:scale-90"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone Widget - Responsive sizing */}
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <div
            onClick={() => setShowMilestoneDetail(true)}
            className="group bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0">
                <Calendar size={16} color={COLORS.PREMIUM} strokeWidth={STROKE_WIDTH} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500/70 leading-none mb-1">Upcoming Event</p>
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">Arthur's 90th Jubilee</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-white/20 ml-2 shrink-0" strokeWidth={STROKE_WIDTH} />
          </div>
        </motion.div>
      </div>

      {/* Main Snap Feed */}
      <div className="snap-container w-full h-full no-scrollbar">
        {MOCK_MEMORIES.map((memory) => (
          <FeedItem
            key={memory.id}
            memory={memory}
            onCommentClick={() => setShowComments(true)}
          />
        ))}
      </div>

      {/* MODALS - Responsively scaled */}

      {/* 1. Full Screen Story Viewer */}
      <AnimatePresence>
        {activeStoryMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20" style={{ marginTop: 'var(--safe-top)' }}>
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5 }}
                onAnimationComplete={() => setActiveStoryMember(null)}
              />
            </div>

            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20" style={{ marginTop: 'var(--safe-top)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStoryMember}`} className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white">{activeStoryMember}</span>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Just Now</span>
                </div>
              </div>
              <button onClick={() => setActiveStoryMember(null)} className="p-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                <X size={16} className="text-white" />
              </button>
            </div>

            <img
              src={`https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=1000`}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-12 left-6 right-6 z-20">
              <div className="p-5 sm:p-7 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl">
                <p className="text-sm sm:text-base font-medium text-white/90 leading-relaxed italic">
                  "Every heirloom carries a piece of the soul that once held it."
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Milestone Detail */}
      <AnimatePresence>
        {showMilestoneDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
          >
            <div className="absolute inset-0" onClick={() => setShowMilestoneDetail(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-[#252329] border border-white/10 p-8 sm:p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <button onClick={() => setShowMilestoneDetail(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500/10 rounded-[1.8rem] flex items-center justify-center border border-yellow-500/20 mb-6">
                <Calendar size={28} color={COLORS.PREMIUM} strokeWidth={STROKE_WIDTH} />
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5 text-white">Arthur's Jubilee</h3>
              <p className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.2em] mb-8">Exclusive Family Event</p>

              <div className="space-y-5 mb-10 text-white/80">
                <div className="flex items-center gap-4">
                  <Clock size={16} className="text-white/30" />
                  <span className="text-xs font-bold">Sep 12, 2024 • 19:00</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin size={16} className="text-white/30" />
                  <span className="text-xs font-bold">The Bavarian Estate, Munich</span>
                </div>
                <div className="flex items-center gap-4">
                  <Users size={16} className="text-white/30" />
                  <span className="text-xs font-bold">All Bloodlines Invited</span>
                </div>
              </div>

              <button className="w-full h-14 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-[0.97] transition-all">
                RSVP Attendance
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Comment Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80dvh] bg-[#1A1918] rounded-t-[3rem] border-t border-white/10 z-[130] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="w-10 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-6 shrink-0" />
              <div className="px-8 pb-5 flex justify-between items-center border-b border-white/5 shrink-0">
                <h3 className="text-xl font-bold tracking-tight text-white">Heritage Chat</h3>
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">{comments.length} Notes</span>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
                {comments.map((comment) => (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0 border border-white/5 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user}`} className="w-full h-full" />
                    </div>
                    <div className="flex-1 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{comment.user}</p>
                        <p className="text-[8px] text-white/10 font-bold">{comment.time}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-6 pb-10 bg-[#1A1918] border-t border-white/5 shrink-0" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1.5rem)' }}>
                <div className="relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Contribute to history..."
                    className="w-full h-14 bg-white/5 rounded-2xl pl-6 pr-14 outline-none border border-white/10 text-xs sm:text-sm font-medium focus:border-purple-500/40 transition-all text-white"
                  />
                  <button onClick={handleAddComment} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                    style={{ backgroundColor: COLORS.PRIMARY }}>
                    <Send size={16} strokeWidth={STROKE_WIDTH} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedScreen;
