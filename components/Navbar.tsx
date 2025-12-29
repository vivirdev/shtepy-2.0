
import React from 'react';
import { Home, Plus, GitBranch, Lock, Grid } from 'lucide-react';
import { AppTab } from '../types/app';
import { COLORS, STROKE_WIDTH } from '../constants/Theme';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 sm:px-8 pb-4 sm:pb-8 pointer-events-none">
      <div className="mx-auto max-w-md w-full glass-dock h-16 sm:h-18 rounded-full px-2 sm:px-6 flex items-center justify-around pointer-events-auto shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

        {/* Navigation Items */}
        <button
          onClick={() => onTabChange('feed')}
          className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${activeTab === 'feed' ? 'scale-110 shadow-lg shadow-purple-900/40' : 'opacity-40 hover:opacity-100'}`}
          style={{ backgroundColor: activeTab === 'feed' ? COLORS.PRIMARY : 'transparent' }}
        >
          <Home color="white" strokeWidth={activeTab === 'feed' ? 1.5 : STROKE_WIDTH} size={22} />
        </button>

        <button
          onClick={() => onTabChange('vault')}
          className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${activeTab === 'vault' ? 'scale-110 shadow-lg shadow-purple-900/40' : 'opacity-40 hover:opacity-100'}`}
          style={{ backgroundColor: activeTab === 'vault' ? COLORS.PRIMARY : 'transparent' }}
        >
          <Grid color="white" strokeWidth={activeTab === 'vault' ? 1.5 : STROKE_WIDTH} size={22} />
        </button>

        <div className="relative">
          <button
            onClick={() => onTabChange('add')}
            className="w-14 h-14 rounded-full border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform hover:bg-white/20 shadow-xl"
            style={{ marginTop: '-20px', background: `linear-gradient(135deg, ${COLORS.PRIMARY}, #8E60C1)` }}
          >
            <Plus color="white" strokeWidth={2.0} size={28} />
          </button>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
            <img src="/assets/logo.png" className="h-3 w-auto" alt="" />
          </div>
        </div>

        <button
          onClick={() => onTabChange('tree')}
          className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${activeTab === 'tree' ? 'scale-110 shadow-lg shadow-purple-900/40' : 'opacity-40 hover:opacity-100'}`}
          style={{ backgroundColor: activeTab === 'tree' ? COLORS.PRIMARY : 'transparent' }}
        >
          <GitBranch color="white" strokeWidth={activeTab === 'tree' ? 1.5 : STROKE_WIDTH} size={22} />
        </button>

        <button
          onClick={() => onTabChange('legacy')}
          className={`relative p-3 rounded-full transition-all duration-300 flex items-center justify-center ${activeTab === 'legacy' ? 'scale-110 shadow-lg shadow-purple-900/40' : 'opacity-40 hover:opacity-100'}`}
          style={{ backgroundColor: activeTab === 'legacy' ? COLORS.PRIMARY : 'transparent' }}
        >
          <Lock color="white" strokeWidth={activeTab === 'legacy' ? 1.5 : STROKE_WIDTH} size={22} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
