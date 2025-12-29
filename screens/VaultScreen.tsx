
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';
import { 
  Search, LayoutGrid, Clock, CheckCircle2, Play, 
  MapPin, X, Heart, Share2, Download, Info, 
  ChevronRight, Trash2, FolderPlus, Sparkles, 
  Filter, ArrowUpDown, Archive, Check, Bookmark,
  MoreVertical, Select
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const CATEGORIES = ["Everything", "Favorites", "Scanned", "Ancestors", "Milestones", "Travel"];

// Enhanced Mock Data
const INITIAL_GRID = Array.from({ length: 24 }).map((_, i) => ({
  id: `${i}`,
  url: `https://picsum.photos/seed/vault${i}/${i % 2 === 0 ? '600/800' : '600/600'}`,
  title: [
    "The Great Migration", "Aunt Sofia's Wedding", "First Estate Deed", 
    "Port of New York", "Grandpa's pocket watch", "The Silver Gala",
    "Letters from Berlin", "Summer in Tuscany", "Vintage Portrait 1920"
  ][i % 9],
  year: 1900 + Math.floor(Math.random() * 120),
  month: ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'][i % 5],
  type: i % 5 === 0 ? 'video' : 'image',
  location: ["Munich", "London", "Paris", "New York", "Vienna"][i % 5],
  category: CATEGORIES[2 + (i % (CATEGORIES.length - 2))],
  story: "A pivotal moment in the Shtepy lineage, capturing the essence of our shared values and timeless elegance. This artifact has been passed down through three generations of keepers.",
  contributor: i % 2 === 0 ? 'Marcus' : 'Elena',
  timestamp: Date.now() - (i * 86400000 * 30) // staggered months
}));

const VaultScreen: React.FC = () => {
  // --- STATE ---
  const [items, setItems] = useState(INITIAL_GRID);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedCategory, setSelectedCategory] = useState("Everything");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<typeof INITIAL_GRID[0] | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set(['1', '3', '5']));
  
  // AI State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // --- LOGIC ---
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesCategory = 
        selectedCategory === "Everything" || 
        (selectedCategory === "Favorites" ? favoritedIds.has(item.id) : item.category === selectedCategory);
      
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.year.toString().includes(searchQuery);
        
      return matchesCategory && matchesSearch;
    });

    return result.sort((a, b) => 
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );
  }, [items, selectedCategory, searchQuery, sortOrder, favoritedIds]);

  const toggleItemSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedItems(next);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = new Set(favoritedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavoritedIds(next);
  };

  const generateLegacyInsight = async (item: typeof INITIAL_GRID[0]) => {
    try {
      setIsGeneratingInsight(true);
      setAiInsight(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a high-end genealogical expert. Provide a prestigious historical insight (approx 30 words) about an artifact titled "${item.title}" from ${item.location}, ${item.year}. Focus on the luxury heritage of the Shtepy family.`;
      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: prompt 
      });
      setAiInsight(response.text);
    } catch (err) {
      setAiInsight("This artifact represents a cornerstone of the Shtepy family's enduring influence, speaking of a time when elegance was woven into the very fabric of daily existence.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleBatchDelete = () => {
    setItems(items.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const handleShare = (item: typeof INITIAL_GRID[0], e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Behold this treasure from the Shtepy Vault: ${item.title} (${item.year})`,
        url: window.location.href
      });
    }
  };

  // --- RENDER HELPERS ---
  const MasonryColumn = ({ items, className }: { items: typeof INITIAL_GRID, className?: string }) => (
    <div className={`flex flex-col gap-3 flex-1 ${className}`}>
      {items.map((item) => (
        <motion.div 
          key={item.id} 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={!selectionMode ? { y: -4 } : {}}
          onClick={() => selectionMode ? toggleItemSelection(item.id) : setActiveItem(item)}
          className={`relative rounded-2xl overflow-hidden border border-white/5 shadow-xl group cursor-pointer transition-shadow ${selectionMode && selectedItems.has(item.id) ? 'ring-2 ring-[#6C4595] shadow-purple-900/20' : 'hover:shadow-black/40'}`}
        >
          <img src={item.url} className={`w-full h-auto transition-all duration-700 group-hover:scale-105 ${selectionMode && !selectedItems.has(item.id) ? 'opacity-40 grayscale blur-[1px]' : 'opacity-90'}`} loading="lazy" />
          
          {/* Item Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <p className="text-[10px] sm:text-xs font-bold text-white mb-0.5">{item.title}</p>
            <p className="text-[8px] sm:text-[9px] text-white/60 uppercase tracking-widest">{item.location} • {item.year}</p>
          </div>

          {/* Selection Badge */}
          {selectionMode && (
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${selectedItems.has(item.id) ? 'bg-[#6C4595] border-transparent scale-110' : 'bg-black/40 border-white/40'}`}>
                  {selectedItems.has(item.id) && <Check size={14} color="white" strokeWidth={3} />}
              </div>
          )}

          {/* Favorite Indicator */}
          {!selectionMode && favoritedIds.has(item.id) && (
            <div className="absolute top-3 left-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
              <Heart size={10} fill={COLORS.PREMIUM} color={COLORS.PREMIUM} strokeWidth={STROKE_WIDTH} />
            </div>
          )}
          
          {!selectionMode && item.type === 'video' && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Play size={10} fill="white" className="ml-0.5" />
              </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="scroll-page px-4 sm:px-8 relative bg-[#1A1918] no-scrollbar">
      {/* HEADER */}
      <header className="mb-6 pt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
           <div>
             <h1 className="text-3xl sm:text-5xl font-bold mb-1 tracking-tighter">The Vault</h1>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(75,186,184,0.8)]" />
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{filteredItems.length} Enshrined Assets</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => { setSelectionMode(!selectionMode); setSelectedItems(new Set()); }}
                className={`flex-1 sm:flex-none h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${selectionMode ? 'bg-[#6C4595] border-transparent text-white shadow-lg shadow-purple-900/30' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                {selectionMode ? <Check size={14} strokeWidth={3} /> : <Filter size={14} />}
                {selectionMode ? 'Finish' : 'Select'}
              </button>
              <div className="bg-white/5 p-1 rounded-2xl flex gap-1 border border-white/10">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}><LayoutGrid size={20} /></button>
                  <button onClick={() => setViewMode('timeline')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}><Clock size={20} /></button>
              </div>
           </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col gap-5">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search lineage archives..." 
                        className="w-full h-14 bg-white/5 rounded-[1.25rem] pl-12 pr-4 outline-none border border-white/10 text-sm font-medium focus:border-[#6C4595] focus:bg-white/[0.07] transition-all text-white placeholder:text-white/20 shadow-inner"
                    />
                </div>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                  className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.25rem] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-inner"
                  title={sortOrder === 'newest' ? "Sort: Oldest First" : "Sort: Newest First"}
                >
                  <ArrowUpDown size={20} />
                </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:bg-white/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </header>

      {/* CONTENT AREA - Responsive Masonry */}
      <LayoutGroup>
        <AnimatePresence mode='wait'>
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout 
              className="flex gap-4 mb-32"
            >
              {/* Responsive columns: 2 on mobile, 3 on tablet, 4 on desktop (simulated by flex chunks) */}
              <MasonryColumn items={filteredItems.filter((_, i) => i % 2 === 0)} className="flex" />
              <MasonryColumn items={filteredItems.filter((_, i) => i % 2 !== 0)} className="flex" />
              {/* On wider screens we'd ideally use more columns, but 2-column masonry is standard for mobile-first. 
                  In a real responsive env, we'd adjust based on window width. */}
            </motion.div>
          ) : (
            <motion.div 
              key="timeline-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pl-8 border-l border-white/10 flex flex-col gap-12 mb-32 relative"
            >
              {filteredItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => selectionMode ? toggleItemSelection(item.id) : setActiveItem(item)} 
                  className={`relative flex flex-col sm:flex-row gap-6 cursor-pointer group transition-all ${selectionMode && selectedItems.has(item.id) ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                >
                  <div className="absolute -left-[41px] top-6 w-4 h-4 rounded-full bg-[#4BBAB8] shadow-[0_0_15px_rgba(75,186,184,0.6)] border-[3px] border-[#1A1918] transition-transform group-hover:scale-125" />
                  <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl relative">
                    <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    {selectionMode && selectedItems.has(item.id) && (
                       <div className="absolute inset-0 bg-[#6C4595]/30 flex items-center justify-center">
                          <Check size={24} className="text-white" strokeWidth={3} />
                       </div>
                    )}
                  </div>
                  <div className="py-2 flex-1">
                    <p className="text-[10px] font-black uppercase text-[#4BBAB8] tracking-[0.3em] mb-1.5 flex items-center gap-2">
                       {item.month} {item.year}
                       {item.type === 'video' && <Play size={10} fill="currentColor" />}
                    </p>
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#4BBAB8] transition-colors">{item.title}</h4>
                    <p className="text-[12px] text-white/40 line-clamp-2 leading-relaxed font-medium">{item.story}</p>
                    <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.location}</span>
                       <div className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Added by {item.contributor}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* BATCH ACTION BAR */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-28 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-xl h-20 rounded-[2.5rem] z-50 flex items-center justify-between px-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-3xl"
            style={{ backgroundColor: `${COLORS.SURFACE}F2` }}
          >
            <div className="flex items-center gap-5">
              <button 
                onClick={handleSelectAll}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <CheckCircle2 size={20} className={selectedItems.size === filteredItems.length ? 'text-[#6C4595]' : ''} />
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-white tracking-[0.1em]">{selectedItems.size} Enshrined</span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Legacy Operations</span>
              </div>
            </div>
            
            <div className="flex gap-3">
                <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-white/5" title="Archive"><Archive size={20} /></button>
                <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-white/5" title="Add to Folder"><FolderPlus size={20} /></button>
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedItems.size === 0}
                  className="w-11 h-11 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-2xl flex items-center justify-center transition-all border border-red-500/20 disabled:opacity-20"
                >
                  <Trash2 size={20} />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL - Enhanced Responsiveness */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col md:flex-row overflow-hidden"
          >
             {/* Image Section */}
             <div className="relative w-full h-[45dvh] md:h-full md:w-[55%] shrink-0 bg-zinc-950 flex items-center justify-center">
               <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={activeItem.url} 
                className="w-full h-full object-contain md:object-cover" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 md:hidden" />
               
               {/* Mobile Top Actions */}
               <div className="absolute top-8 left-6 right-6 flex justify-between items-center md:hidden">
                  <button onClick={() => setActiveItem(null)} className="p-3.5 bg-black/60 rounded-[1.25rem] border border-white/10 text-white backdrop-blur-md active:scale-90 transition-all">
                    <X size={20} />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleFavorite(activeItem.id)} className="p-3.5 bg-black/60 rounded-[1.25rem] border border-white/10 backdrop-blur-md">
                      <Heart size={20} fill={favoritedIds.has(activeItem.id) ? COLORS.PREMIUM : "none"} color={favoritedIds.has(activeItem.id) ? COLORS.PREMIUM : "white"} />
                    </button>
                  </div>
               </div>
             </div>
             
             {/* Content Section */}
             <div className="flex-1 md:w-[45%] h-[55dvh] md:h-full bg-[#1A1918] border-l border-white/5 flex flex-col overflow-hidden">
                {/* Desktop Top Header (Hidden on Mobile) */}
                <div className="hidden md:flex items-center justify-between px-10 py-8 border-b border-white/5 shrink-0">
                  <button onClick={() => setActiveItem(null)} className="flex items-center gap-3 text-white/40 hover:text-white transition-all group">
                     <X size={20} className="group-hover:rotate-90 transition-transform" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Close Archive</span>
                  </button>
                  <div className="flex gap-3">
                     <button onClick={() => toggleFavorite(activeItem.id)} className={`p-3 rounded-2xl border transition-all ${favoritedIds.has(activeItem.id) ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
                       <Heart size={18} fill={favoritedIds.has(activeItem.id) ? COLORS.PREMIUM : "none"} color={favoritedIds.has(activeItem.id) ? COLORS.PREMIUM : "white"} />
                     </button>
                     <button onClick={(e) => handleShare(activeItem, e)} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                       <Share2 size={18} color="white" />
                     </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 md:py-12 no-scrollbar">
                   <div className="mb-10">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3.5 py-1.5 bg-[#4BBAB8]/10 text-[#4BBAB8] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#4BBAB8]/20">{activeItem.category}</span>
                        {activeItem.type === 'video' && (
                          <span className="px-3.5 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-500/20 flex items-center gap-1.5">
                            <Play size={10} fill="currentColor" /> Motion Archive
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl font-bold leading-[1.1] text-white tracking-tighter mb-4">{activeItem.title}</h2>
                      
                      <div className="flex items-center gap-5 text-white/40 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-white/[0.02] border border-white/5 p-4 rounded-2xl inline-flex">
                         <span className="flex items-center gap-2"><MapPin size={12} className="text-teal-400" /> {activeItem.location}</span>
                         <div className="w-1 h-1 rounded-full bg-white/20" />
                         <span className="flex items-center gap-2"><Clock size={12} className="text-teal-400" /> {activeItem.year}</span>
                      </div>
                   </div>

                   <div className="bg-white/[0.03] p-6 sm:p-8 rounded-[2rem] border border-white/5 mb-10 shadow-inner group">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
                        <Bookmark size={10} /> Archivist Note
                      </p>
                      <p className="text-base sm:text-lg leading-relaxed text-white/80 font-medium italic">"{activeItem.story}"</p>
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shadow-xl">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeItem.contributor}`} className="w-full h-full" />
                            </div>
                            <div>
                               <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Preserved By</p>
                               <p className="text-[10px] font-bold text-white tracking-tight">{activeItem.contributor} Shtepy</p>
                            </div>
                         </div>
                         <p className="text-[9px] text-white/10 font-black uppercase">Ref ID: SH-{activeItem.id.padStart(4, '0')}</p>
                      </div>
                   </div>

                   {/* AI INSIGHT SECTION - Enhanced UI */}
                   <div className="bg-gradient-to-br from-[#111] to-[#1A1918] p-8 rounded-[2.5rem] border border-white/5 mb-12 relative overflow-hidden group shadow-2xl">
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#6C4595]/10 blur-[60px] group-hover:bg-[#6C4595]/20 transition-all duration-1000" />
                     <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#4BBAB8]/5 blur-[60px]" />
                     
                     <div className="flex items-center justify-between mb-8 relative z-10">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-[1.25rem] bg-[#FDC634]/10 flex items-center justify-center border border-[#FDC634]/20 shadow-lg">
                           <Sparkles size={22} className="text-[#FDC634]" />
                         </div>
                         <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FDC634]">Legacy Insight</span>
                           <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Shtepy Intelligence AI</p>
                         </div>
                       </div>
                       
                       <AnimatePresence>
                         {!aiInsight && !isGeneratingInsight && (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => generateLegacyInsight(activeItem)}
                              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-teal-400 hover:bg-teal-400/10 hover:border-teal-400/40 transition-all shadow-lg active:scale-95"
                            >
                              Decrypt Heritage
                            </motion.button>
                         )}
                       </AnimatePresence>
                     </div>
                     
                     <AnimatePresence mode="wait">
                       {isGeneratingInsight ? (
                         <motion.div 
                           key="loading-insight"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="flex flex-col gap-3 relative z-10"
                         >
                            <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                               <motion.div animate={{ left: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                            <div className="h-3.5 w-[85%] bg-white/5 rounded-full overflow-hidden relative">
                               <motion.div animate={{ left: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-2 animate-pulse">Consulting high-council records...</p>
                         </motion.div>
                       ) : aiInsight ? (
                         <motion.div
                           key="content-insight"
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="relative z-10"
                         >
                            <p className="text-lg text-white leading-relaxed font-semibold italic border-l-[3px] border-[#FDC634]/50 pl-8 drop-shadow-sm">
                              {aiInsight}
                            </p>
                            <button 
                              onClick={() => setAiInsight(null)}
                              className="mt-8 text-[9px] font-black uppercase text-white/20 hover:text-white transition-colors tracking-widest"
                            >
                              Refresh Oracle
                            </button>
                         </motion.div>
                       ) : null}
                     </AnimatePresence>
                   </div>
                </div>

                {/* Mobile/Small Screen Bottom Action Fixed Bar */}
                <div className="p-8 sm:px-10 pb-12 bg-gradient-to-t from-black to-transparent shrink-0">
                   <div className="flex gap-4">
                      <button className="flex-1 h-16 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all">
                        <Download size={20} /> Download HD
                      </button>
                      <button onClick={(e) => handleShare(activeItem, e)} className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white/60 hover:text-white active:scale-95 transition-all md:hidden">
                        <Share2 size={24} />
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VaultScreen;
