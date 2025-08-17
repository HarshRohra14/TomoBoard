import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { useToast } from '../../contexts/ToastContext';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import Sidebar from './Sidebar';
import Header from './Header';
import WhiteboardTab from '../tabs/WhiteboardTab';
import VideosTab from '../tabs/VideosTab';
import DocsTab from '../tabs/DocsTab';
import PodcastsTab from '../tabs/PodcastsTab';
import AITab from '../tabs/AITab';
import CollaborationPanel from '../collaboration/CollaborationPanel';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const { showToggleToast } = useToast();

  const handleToggleSidebar = () => {
    const newVisibility = !isSidebarVisible;
    setIsSidebarVisible(newVisibility);
    showToggleToast('toggle', 'sidebar', newVisibility);
  };

  const handleToggleToolbar = () => {
    const newVisibility = !isToolbarVisible;
    setIsToolbarVisible(newVisibility);
    showToggleToast('toggle', 'toolbar', newVisibility);
  };

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onToggleSidebar: handleToggleSidebar,
    onToggleToolbar: handleToggleToolbar,
    activeTab
  });

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
    <WebSocketProvider>
      <div className="flex h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-hidden">
        {/* Sidebar */}
        {isSidebarVisible && (
          <div className="flex-shrink-0 z-40">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-shrink-0">
            <Header
              activeTab={activeTab}
              isSidebarVisible={isSidebarVisible}
              isToolbarVisible={isToolbarVisible}
              onToggleSidebar={handleToggleSidebar}
              onToggleToolbar={handleToggleToolbar}
              shortcuts={shortcuts}
            />
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-hidden relative">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-hidden"
            >
              {activeTab === 'whiteboard' ? (
                <WhiteboardTab
                  isToolbarVisible={isToolbarVisible}
                  isSidebarVisible={isSidebarVisible}
                />
              ) : (
                renderActiveTab()
              )}
            </motion.div>

            {/* Collaboration Panel */}
            <CollaborationPanel
              isOpen={isCollaborationOpen}
              onToggle={() => setIsCollaborationOpen(!isCollaborationOpen)}
            />
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
};

export default Dashboard;
