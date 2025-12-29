
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTab } from './types/app';
import FeedScreen from './screens/FeedScreen';
import VaultScreen from './screens/VaultScreen';
import AddScreen from './screens/AddScreen';
import TreeScreen from './screens/TreeScreen';
import LegacyScreen from './screens/LegacyScreen';
import Navbar from './components/Navbar';
import { COLORS } from './constants/Theme';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('feed');

  const renderContent = () => {
    const screens = {
      feed: <FeedScreen />,
      vault: <VaultScreen />,
      tree: <TreeScreen />,
      legacy: <LegacyScreen />,
      add: <AddScreen />,
    };

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
      >
        {screens[activeTab] || screens.feed}
      </motion.div>
    );
  };

  return (
    <div 
      className="h-screen w-screen relative flex flex-col overflow-hidden"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      <main className="flex-1 w-full h-full relative">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <Navbar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
      />
      
      {activeTab === 'feed' && (
          <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none z-40" />
      )}
    </div>
  );
};

export default App;
