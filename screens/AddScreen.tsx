
import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Zap, X, Video, Users, ArrowRight, Sparkles, Send, FileText, Check } from 'lucide-react';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

const AddScreen: React.FC = () => {
  // Navigation & UI States
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // New Functional States
  const [dailyPrompt, setDailyPrompt] = useState<string>("Loading your heritage prompt...");
  const [quickNote, setQuickNote] = useState("");
  const [isEnshrining, setIsEnshrining] = useState(false);
  const [enshrinedResult, setEnshrinedResult] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    generateDailyPrompt();
  }, []);

  const generateDailyPrompt = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "Generate a single, deeply evocative 10-word question to prompt a grandparent to share a specific family memory. Example: 'What scent always brings you back to your mother's kitchen?'";
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setDailyPrompt(response.text || "What story does your oldest photograph tell?");
    } catch (err) {
      setDailyPrompt("What is the most important lesson you've learned?");
    }
  };

  const handleScan = async () => {
    setIsAnalyzing(true);
    setScanResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "Act as a high-end family archivist. Describe this hypothetical scanned photograph from a random generation. Be descriptive and warm. Limit to 30 words.";
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setScanResult(response.text);
    } catch (err) {
      setScanResult("A precious moment of the Shtepy family lineage, now safely archived.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadMedia = async () => {
    setIsUploading(true);
    setUploadResult(null);
    try {
      // Simulate file picker wait
      await new Promise(r => setTimeout(r, 1000));
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "A user just uploaded a digital photo to their family archive. Generate a short 'Heritage Insight' (20 words) about why preserving digital artifacts matters for the next 100 years.";
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setUploadResult(response.text);
    } catch (err) {
      setUploadResult("Digital legacy secured. Your history is now timeless.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEnshrineNote = async () => {
    if (!quickNote.trim()) return;
    setIsEnshrining(true);
    setEnshrinedResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Transform this simple note into a 'Luxury Legacy' quote. 
      Input: "${quickNote}"
      Output: A one-sentence, poetic, high-end reflection. 
      Tone: Prestigious, timeless, Shtepy brand.`;
      
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setEnshrinedResult(response.text);
    } catch (err) {
      setEnshrinedResult("Every thought shared becomes a stone in the foundation of our history.");
    } finally {
      setIsEnshrining(false);
    }
  };

  const handleJoinMeeting = async () => {
    setShowSessionModal(true);
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "Simulate a 3-point summary of a prestigious family meeting discussing legacy, upcoming milestones, and archiving old letters. Keep it formal and exclusive.";
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setSessionSummary(response.text);
    } catch (err) {
      setSessionSummary("1. Legacy review of 19th-century records.\n2. Planning for the Jubilee.\n3. Digital security update.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="scroll-page flex flex-col items-center pt-16 px-6 relative bg-[#1A1918] no-scrollbar">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-600 rounded-full blur-[100px]" />
      </div>

      <header className="z-10 text-center mb-8 w-full flex flex-col items-center">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-2xl"
        >
           <Zap color={COLORS.PRIMARY} size={24} strokeWidth={STROKE_WIDTH} />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tighter mb-1">Create & Connect</h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="max-w-xs mx-auto text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          The next chapter of your legacy
        </p>
      </header>

      {/* Daily Prompt Widget */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm mb-8 z-10"
      >
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-colors" />
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-teal-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-400/80">Heritage Prompt of the Day</span>
          </div>
          <p className="text-sm font-medium leading-relaxed italic text-white/90">"{dailyPrompt}"</p>
          <button className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">
            Share Answer <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-6 z-10 mb-12">
        {/* Story Session Card */}
        <div className="relative group overflow-hidden rounded-[32px] p-8 border border-white/10 bg-[#252329] shadow-2xl transition-all hover:border-white/20">
           <div className="absolute top-0 right-0 p-6">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
                 <Video size={18} color={COLORS.PRIMARY} strokeWidth={STROKE_WIDTH} />
              </div>
           </div>
           
           <div className="flex -space-x-3 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#252329] overflow-hidden bg-zinc-800 shadow-xl transition-transform group-hover:translate-x-1">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 10}`} alt="Avatar" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#252329] bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                 +5
              </div>
           </div>

           <h3 className="text-xl font-bold mb-2 tracking-tight">Join Story Session</h3>
           <p className="text-xs opacity-50 mb-6 leading-relaxed" style={{ color: COLORS.TEXT_SECONDARY }}>
             Collaborate in real-time. Share memories via voice and video with the entire bloodline.
           </p>

           <button 
             onClick={handleJoinMeeting}
             className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-purple-900/20"
             style={{ backgroundColor: COLORS.PRIMARY }}>
              <span className="text-xs font-black uppercase tracking-widest text-white">Initiate Meeting</span>
              <ArrowRight size={16} color="white" strokeWidth={STROKE_WIDTH} />
           </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => setIsScanning(true)}
             className="group h-44 rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/5 hover:border-teal-500/20 active:scale-95 shadow-xl"
             style={{ backgroundColor: COLORS.SURFACE }}
           >
             <div className="p-4 rounded-2xl bg-teal-500/10 group-hover:scale-110 transition-transform">
               <Camera color={COLORS.TECH} strokeWidth={STROKE_WIDTH} size={28} />
             </div>
             <div className="text-center">
               <span className="block font-black text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: COLORS.TECH }}>Scan Artifact</span>
               <span className="text-[8px] text-white/30 font-bold">Physical Records</span>
             </div>
           </button>

           <button 
             onClick={handleUploadMedia}
             disabled={isUploading}
             className="group h-44 rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/5 hover:border-purple-500/20 active:scale-95 shadow-xl disabled:opacity-50"
             style={{ backgroundColor: COLORS.SURFACE }}
           >
             <div className="p-4 rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform">
               {isUploading ? (
                 <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
               ) : (
                 <ImageIcon color={COLORS.PRIMARY} strokeWidth={STROKE_WIDTH} size={28} />
               )}
             </div>
             <div className="text-center">
               <span className="block font-black text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: COLORS.PRIMARY }}>Upload Media</span>
               <span className="text-[8px] text-white/30 font-bold">Gallery Picker</span>
             </div>
           </button>
        </div>

        {/* Quick Enshrinement (Text to Legacy) */}
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
           <div className="flex items-center gap-3 mb-6">
              <FileText size={18} className="text-purple-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Quick Enshrinement</span>
           </div>
           <div className="relative">
              <textarea 
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Type a fleeting memory or thought..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm min-h-[120px] outline-none focus:border-purple-500/40 transition-all text-white/80 no-scrollbar resize-none"
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleEnshrineNote}
                disabled={isEnshrining || !quickNote}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl disabled:opacity-30 disabled:grayscale transition-all"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                {isEnshrining ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              </motion.button>
           </div>

           <AnimatePresence>
             {enshrinedResult && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="mt-6 p-6 rounded-2xl bg-white/5 border border-purple-500/20 relative overflow-hidden group"
               >
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                  <p className="text-xs font-medium italic text-purple-200/90 leading-relaxed">
                    "{enshrinedResult}"
                  </p>
                  <button onClick={() => { setEnshrinedResult(null); setQuickNote(""); }} className="mt-4 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white flex items-center gap-2">
                    <Check size={10} /> Add to Legacy Vault
                  </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Upload Feedback Toast */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 z-[100] bg-[#252329] border border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4"
          >
             <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                <Check size={20} className="text-green-500" />
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Archive Secure</p>
                <p className="text-[11px] font-medium text-white/80 leading-relaxed">"{uploadResult}"</p>
             </div>
             <button onClick={() => setUploadResult(null)} className="p-2 text-white/20"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Mock Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex flex-col"
          >
              <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
                  <button onClick={() => { setIsScanning(false); setScanResult(null); }} className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                      <X color="white" size={24} strokeWidth={STROKE_WIDTH} />
                  </button>
                  <div className="px-5 py-2 bg-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-lg">Artifact Scanning Mode</div>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center">
                  <img src="https://picsum.photos/seed/legacy-artifact/1080/1920" className="w-full h-full object-cover opacity-50 grayscale" />
                  <div className="absolute inset-10 border-2 border-teal-500/40 rounded-3xl pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_20px_rgba(75,186,184,1)] animate-[scan_4s_ease-in-out_infinite]" />
                  </div>
                  
                  {scanResult && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="absolute bottom-32 left-8 right-8 bg-[#1A1918]/95 backdrop-blur-2xl border border-teal-500/30 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles size={18} className="text-teal-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Archival Interpretation</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic text-white/90">"{scanResult}"</p>
                        <button className="mt-6 w-full h-12 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Save to History</button>
                    </motion.div>
                  )}
              </div>

              <div className="p-12 pb-24 flex justify-center items-center gap-12 bg-black border-t border-white/5">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                    <History size={24} />
                  </div>
                  <button 
                    onClick={handleScan}
                    disabled={isAnalyzing}
                    className="w-24 h-24 rounded-full border-[6px] border-white/10 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 relative group"
                  >
                      {isAnalyzing ? (
                        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-18 h-18 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform" />
                      )}
                  </button>
                  <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                      <ImageIcon size={24} color="white" strokeWidth={STROKE_WIDTH} />
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Summary Modal */}
      <AnimatePresence>
        {showSessionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl"
          >
             <div className="absolute inset-0" onClick={() => setShowSessionModal(false)} />
             <motion.div 
               initial={{ scale: 0.9, y: 30 }}
               animate={{ scale: 1, y: 0 }}
               className="relative w-full max-w-sm bg-[#252329] border border-white/10 p-10 rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
             >
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mb-8">
                   <Video size={28} color={COLORS.PRIMARY} strokeWidth={STROKE_WIDTH} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-2">Session Summary</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-8">AI Chronological Minutes</p>
                
                {isGeneratingSummary ? (
                   <div className="space-y-4">
                      <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                   </div>
                ) : (
                  <div className="text-sm leading-relaxed text-white/70 space-y-6 whitespace-pre-line bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner italic">
                    {sessionSummary}
                  </div>
                )}

                <button 
                  onClick={() => setShowSessionModal(false)}
                  className="w-full h-16 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] mt-10 active:scale-95 transition-transform shadow-2xl"
                >
                  Seal & Archive
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scan {
            0%, 100% { top: 0%; }
            50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

// Mock History icon if missing from lucide
const History = ({ size, color }: { size?: number, color?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export default AddScreen;
