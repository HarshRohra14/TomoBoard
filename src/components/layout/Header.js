import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Share2,
  Save,
  Download,
  Bell,
  Search,
  Plus,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ activeTab, title, subtitle }) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'whiteboard':
        return {
          title: 'Collaborative Whiteboard',
          subtitle: 'Real-time drawing and collaboration',
          actions: [
            { icon: Users, label: 'Invite', count: 3 },
            { icon: Share2, label: 'Share' },
            { icon: Save, label: 'Save' },
            { icon: Download, label: 'Export' },
          ]
        };
      case 'videos':
        return {
          title: 'Video Library',
          subtitle: 'Manage and share your videos',
          actions: [
            { icon: Plus, label: 'Upload' },
            { icon: Share2, label: 'Share' },
          ]
        };
      case 'docs':
        return {
          title: 'Documents',
          subtitle: 'Create and organize documents',
          actions: [
            { icon: Plus, label: 'New Doc' },
            { icon: Share2, label: 'Share' },
          ]
        };
      case 'podcasts':
        return {
          title: 'Podcasts',
          subtitle: 'Audio content and recordings',
          actions: [
            { icon: Plus, label: 'Record' },
            { icon: Share2, label: 'Share' },
          ]
        };
      case 'ai':
        return {
          title: 'AI Features',
          subtitle: 'Powered by artificial intelligence',
          actions: [
            { icon: Sparkles, label: 'Generate' },
          ]
        };
      default:
        return {
          title: 'TomoBoard',
          subtitle: 'Collaborative workspace',
          actions: []
        };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="header px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{title || tabInfo.title}</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{subtitle || tabInfo.subtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted-light dark:text-text-muted-dark" />
            </div>
            <input
              type="text"
              className="input-field pl-10 w-full"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {tabInfo.actions.map((action, index) => (
            <button
              key={index}
              className="btn-secondary flex items-center space-x-2"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
              {action.count && (
                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                  {action.count}
                </span>
              )}
            </button>
          ))}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
