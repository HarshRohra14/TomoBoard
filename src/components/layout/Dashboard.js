import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import WhiteboardTab from '../tabs/WhiteboardTab';
import VideosTab from '../tabs/VideosTab';
import DocsTab from '../tabs/DocsTab';
import PodcastsTab from '../tabs/PodcastsTab';
import AITab from '../tabs/AITab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('whiteboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'whiteboard':
        return <WhiteboardTab />;
      case 'videos':
        return <VideosTab />;
      case 'docs':
        return <DocsTab />;
      case 'podcasts':
        return <PodcastsTab />;
      case 'ai':
        return <AITab />;
      default:
        return <WhiteboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderActiveTab()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
