
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';
import { FamilyMember } from '../types/app';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  GitBranch, MapPin, Calendar, BookOpen, X, Play, Share2, Heart, 
  Globe, Fingerprint, Award, Compass, ShieldCheck, ChevronDown,
  Pause, Search, UserPlus, Sparkles, Wand2, History, ChevronRight
} from 'lucide-react';

const INITIAL_FAMILY_DATA: FamilyMember[] = [
  { 
    id: '1', 
    name: 'Arthur Shtepy', 
    role: 'The Architect', 
    avatar: 'Arthur', 
    birthYear: '1932', 
    deathYear: '2018',
    location: 'Munich, Germany',
    birthPlace: 'Bavaria',
    traits: ['Resilience', 'Precision', 'Vision'],
    memoryCount: 142,
    contribution: 'Established the Shtepy Watchmaking Guild',
    bio: 'Arthur was the first to formalize the family archive. His obsession with time led him to believe that memories are the only currency that never devalues.'
  },
  { 
    id: '2', 
    name: 'Elena Shtepy', 
    role: 'The Preserver', 
    avatar: 'Elena', 
    parentId: '1', 
    birthYear: '1938',
    location: 'London, UK',
    birthPlace: 'Munich',
    traits: ['Harmony', 'Tradition', 'Eloquence'],
    memoryCount: 89,
    contribution: 'Curated the Imperial Recipe Collection',
    bio: 'Elena bridged the gap between the Old World and the New. She believed that a family is only as strong as the stories told around the dinner table.'
  },
  { 
    id: '3', 
    name: 'Marcus Shtepy', 
    role: 'Digital Guardian', 
    avatar: 'Marcus', 
    parentId: '1', 
    birthYear: '1965',
    location: 'New York, USA',
    birthPlace: 'London',
    traits: ['Innovation', 'Legacy', 'Strategy'],
    memoryCount: 256,
    contribution: 'Developed the Shtepy Digital Vault',
    bio: 'As a digital architect, Marcus took the physical archives and built the infrastructure for the next century of our history.'
  },
  { 
    id: '4', 
    name: 'Sara Shtepy', 
    role: 'The Voyager', 
    avatar: 'Sara', 
    parentId: '2', 
    birthYear: '1992',
    location: 'Paris, France',
    birthPlace: 'New York',
    traits: ['Curiosity', 'Artistry', 'Connection'],
    memoryCount: 43,
    contribution: 'Connecting European Branches',
    bio: "Sara travels between our historical homes, ensuring that the distance between family members doesn't become a distance between hearts."
  },
];

const TreeScreen: React.FC = () => {
  // --- STATE ---
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Member Creation State
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberYear, setNewMemberYear] = useState("");
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  // AI Insights State
  const [legacyDNA, setLegacyDNA] = useState<string | null>(null);
  const [isGeneratingDNA, setIsGeneratingDNA] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // --- LOGIC ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleHearStoryEcho = async (member: FamilyMember) => {
    if (isNarrating) {
      sourceNodeRef.current?.stop();
      setIsNarrating(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Narrate the life of ${member.name}, known as ${member.role}. Use a deep, resonant, and prestigious voice. Mention their contribution: ${member.contribution}. End with their life philosophy: ${member.bio}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' }, 
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
      console.error("Echo failed:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const discoverLegacyDNA = async (member: FamilyMember) => {
    try {
      setIsGeneratingDNA(true);
      setLegacyDNA(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze the character of ${member.name} (${member.role}). Traits: ${member.traits.join(', ')}. Create a 20-word "Spiritual DNA" summary for the family archives. Make it sound like an ancient, prestigious blessing.`;
      const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
      setLegacyDNA(response.text);
    } catch (err) {
      setLegacyDNA("A spirit of unyielding elegance, carving order from the chaos of time.");
    } finally {
      setIsGeneratingDNA(false);
    }
  };

  const handleAddMemberAI = async () => {
    if (!newMemberName) return;
    setIsGeneratingProfile(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Create a prestigious family member profile for the "Shtepy" lineage. 
      Name: ${newMemberName}
      Birth Year: ${newMemberYear || '1880'}
      Provide: 1. A unique role (e.g., The Keeper of Seals), 2. A location, 3. Three traits, 4. A major contribution to the family.
      Format: JSON with keys: role, location, traits (array), contribution, bio.`;
      
      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const details = JSON.parse(response.text);
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: newMemberName,
        birthYear: newMemberYear || '1880',
        avatar: newMemberName,
        memoryCount: 0,
        birthPlace: details.location,
        ...details
      };

      setMembers([...members, newMember]);
      setNewMemberName("");
      setNewMemberYear("");
      setShowAddMember(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  // --- RENDER HELPERS ---
  const BloodlineSVG = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="bloodlineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.TECH} stopOpacity="0.8" />
          <stop offset="50%" stopColor={COLORS.PRIMARY} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <motion.path 
        d={`M 50% 100 L 50% 1200`} 
        stroke="url(#bloodlineGradient)" 
        strokeWidth="1.5" 
        strokeDasharray="8,8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
    </svg>
  );

  const MemberVessel = ({ member, index, isSecondary }: { member: FamilyMember; index: number; isSecondary?: boolean }) => (
    <motion.div 
      onClick={() => {
        setSelectedMember(member);
        setLegacyDNA(null);
      }}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ 
        opacity: searchQuery ? (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0.2) : 1, 
        y: 0, 
        scale: isSecondary ? 0.9 : 1 
      }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative flex flex-col items-center group cursor-pointer z-10"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-b from-white/20 to-transparent shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <motion.div 
          className="absolute -inset-3 bg-purple-500/10 rounded-full blur-2xl opacity-0 transition-opacity"
          whileHover={{ opacity: 1 }}
        />
        
        <div className={`w-full h-full rounded-full overflow-hidden bg-[#252329] border border-white/10 relative transition-all ${member.deathYear ? 'grayscale opacity-50' : 'group-hover:ring-2 ring-purple-500/40'}`}>
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} 
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Status Indicators */}
        <div className="absolute -top-1 -right-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <span className="text-[7px] font-black text-white/50 uppercase tracking-widest">{member.birthYear}</span>
        </div>
      </div>

      <div className="mt-5 text-center px-2">
        <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white mb-0.5 group-hover:text-purple-400 transition-colors truncate max-w-[120px]">{member.name}</h4>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#4BBAB8] opacity-60">{member.role}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="scroll-page px-4 sm:px-8 relative flex flex-col bg-[#1A1918] no-scrollbar">
      {/* HEADER SECTION */}
      <header className="mb-10 pt-16 z-20">
        <div className="flex justify-between items-start mb-8">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter mb-2">Generations</h1>
              <div className="flex items-center gap-2">
                 <GitBranch size={12} className="text-teal-400" />
                 <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-black text-white/30">The Living Bloodline</p>
              </div>
           </motion.div>
           <button 
             onClick={() => setShowAddMember(true)}
             className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-white/10 transition-all shadow-xl active:scale-90"
           >
              <UserPlus size={20} className="text-white/60 group-hover:text-white" strokeWidth={STROKE_WIDTH} />
           </button>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-md mx-auto sm:mx-0">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={18} />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search ancestors by name or role..."
             className="w-full h-14 bg-white/5 rounded-[1.5rem] border border-white/10 pl-12 pr-6 outline-none focus:bg-white/[0.08] focus:border-purple-500/40 transition-all text-sm font-medium"
           />
        </div>
      </header>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-3 mb-16 z-10">
         {[
           { Icon: Globe, label: '14 Regions', color: 'text-teal-400' },
           { Icon: Award, label: '92 Rank', color: 'text-yellow-500' },
           { Icon: Compass, label: '192 Yrs', color: 'text-purple-400' }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 + (i * 0.1) }}
             className="bg-white/3 rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center backdrop-blur-md"
           >
              <stat.Icon size={16} className={`${stat.color} mb-2 opacity-60`} strokeWidth={STROKE_WIDTH} />
              <span className="text-[10px] font-bold whitespace-nowrap text-white/80">{stat.label}</span>
           </motion.div>
         ))}
      </div>

      {/* THE TREE GRID */}
      <div className="relative flex-1 flex flex-col items-center gap-24 py-10 min-h-[800px]">
        <BloodlineSVG />
        
        {/* Tier 1 - Root */}
        <div className="flex justify-center">
           <MemberVessel member={members[0]} index={0} />
        </div>
        
        {/* Tier 2 - Branches */}
        <div className="w-full flex justify-center gap-12 sm:gap-24 relative px-4">
           {members.slice(1, 3).map((m, i) => (
             <MemberVessel key={m.id} member={m} index={i+1} isSecondary />
           ))}
        </div>
        
        {/* Tier 3 - New Generations */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-20 px-4">
           {members.slice(3).map((m, i) => (
             <MemberVessel key={m.id} member={m} index={i+3} />
           ))}
        </div>

        {/* End of Line Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex flex-col items-center gap-4 opacity-20"
        >
           <ChevronDown size={24} className="animate-bounce" />
           <span className="text-[8px] font-black uppercase tracking-[0.4em]">Future Lineage</span>
        </motion.div>
      </div>

      {/* MEMBER DETAIL MODAL */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-6"
          >
             <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setSelectedMember(null)} />
             
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="relative w-full max-w-lg bg-[#252329] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col"
              >
                <div className="h-40 sm:h-56 relative shrink-0">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#6C4595]/20 via-transparent to-[#252329]" />
                   <img 
                    src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800`} 
                    className="absolute inset-0 w-full h-full object-cover opacity-10" 
                   />
                   
                   <button 
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-6 right-6 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 text-white active:scale-90 transition-all"
                   >
                      <X size={20} strokeWidth={STROKE_WIDTH} />
                   </button>
                   
                   <div className="absolute -bottom-8 left-10">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-[#252329] p-1.5 border border-white/10 shadow-2xl overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.avatar}`} className="w-full h-full" />
                      </div>
                   </div>
                </div>

                <div className="px-8 sm:px-12 pt-14 pb-12 overflow-y-auto no-scrollbar">
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <h2 className="text-3xl font-bold tracking-tight mb-2">{selectedMember.name}</h2>
                         <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-teal-400 uppercase tracking-widest bg-teal-400/5 px-3 py-1.5 rounded-full border border-teal-400/10">
                              <MapPin size={10} /> {selectedMember.location || 'Munich'}
                            </span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Established</p>
                         <p className="text-sm font-bold text-white">{selectedMember.birthYear} — {selectedMember.deathYear || 'Present'}</p>
                      </div>
                   </div>

                   <div className="space-y-8 mb-10">
                      <div className="bg-white/3 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                         <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck size={16} className="text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Ancestral Contribution</span>
                         </div>
                         <p className="text-sm font-medium leading-relaxed italic text-white/90">
                           {selectedMember.contribution}
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Fingerprint size={16} className="text-teal-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Core Traits</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedMember.traits?.map(trait => (
                                <span key={trait} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-white/60">
                                    {trait}
                                </span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-yellow-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Archives</span>
                            </div>
                            <p className="text-lg font-bold text-white">{selectedMember.memoryCount || 0} Assets</p>
                        </div>
                      </div>

                      {/* AI LEGACY DNA SECTION */}
                      <div className="bg-gradient-to-br from-black/40 to-black/10 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 blur-3xl" />
                        
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                              <Sparkles size={16} className="text-yellow-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/60">Spiritual DNA</span>
                           </div>
                           {!legacyDNA && !isGeneratingDNA && (
                             <button 
                               onClick={() => discoverLegacyDNA(selectedMember)}
                               className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors border-b border-white/10 pb-0.5"
                             >
                               Decode Legacy
                             </button>
                           )}
                        </div>

                        <AnimatePresence mode="wait">
                          {isGeneratingDNA ? (
                            <motion.div key="dna-loading" className="flex flex-col gap-2">
                               <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div animate={{ left: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute h-full w-1/2 bg-white/10 relative" />
                               </div>
                               <div className="h-3 w-2/3 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div animate={{ left: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.2 }} className="absolute h-full w-1/2 bg-white/10 relative" />
                               </div>
                            </motion.div>
                          ) : legacyDNA ? (
                            <motion.p 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              className="text-base text-white/80 italic font-medium leading-relaxed"
                            >
                              "{legacyDNA}"
                            </motion.p>
                          ) : (
                            <p className="text-[10px] text-white/10 uppercase tracking-widest italic font-bold">DNA signature pending calibration...</p>
                          )}
                        </AnimatePresence>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleHearStoryEcho(selectedMember)}
                        className={`flex-1 h-16 rounded-[2rem] font-bold text-sm flex items-center justify-center gap-4 shadow-2xl transition-all ${isNarrating ? 'bg-[#6C4595] text-white' : 'bg-white text-black'}`}
                      >
                         {isLoadingAudio ? (
                           <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                         ) : isNarrating ? (
                           <Pause size={20} fill="currentColor" />
                         ) : (
                           <Play size={20} fill="black" />
                         )}
                         {isNarrating ? 'Silence Echo' : 'Echo Narrative'}
                      </motion.button>
                      <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-white/60 active:scale-95 transition-all">
                         <Share2 size={22} />
                      </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD MEMBER MODAL */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
             <div className="absolute inset-0" onClick={() => setShowAddMember(false)} />
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="relative w-full max-w-sm bg-[#252329] border border-white/10 p-10 rounded-[3.5rem] shadow-2xl"
             >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-8">
                   <UserPlus size={28} className="text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold tracking-tighter mb-2">Invite Ancestor</h3>
                <p className="text-sm text-white/40 mb-10">Let AI curate the historical role for your lineage.</p>

                <div className="space-y-6 mb-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Legacy Name</label>
                      <input 
                        type="text" 
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="e.g., Baroness Sofia" 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-purple-500/40 text-sm"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Origin Year</label>
                      <input 
                        type="text" 
                        value={newMemberYear}
                        onChange={(e) => setNewMemberYear(e.target.value)}
                        placeholder="e.g., 1892" 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-purple-500/40 text-sm"
                      />
                   </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddMemberAI}
                  disabled={isGeneratingProfile || !newMemberName}
                  className="w-full h-16 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                >
                   {isGeneratingProfile ? (
                     <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                   ) : (
                     <>
                        <Wand2 size={18} />
                        Consult Records
                     </>
                   )}
                </motion.button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeScreen;
