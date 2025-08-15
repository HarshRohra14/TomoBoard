import React from 'react';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  Video, 
  FileText, 
  Mic, 
  Sparkles, 
  Settings, 
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'docs', label: 'Documents', icon: FileText },
    { id: 'podcasts', label: 'Podcasts', icon: Mic },
    { id: 'ai', label: 'AI Features', icon: Sparkles, isPro: true },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sidebar w-64 flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sakura-600 dark:bg-sakura-500 rounded-lg flex items-center justify-center animate-sakura-bloom">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">TomoBoard</h1>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Sakura Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`sidebar-item w-full ${
              activeTab === item.id ? 'active' : ''
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.isPro && user?.plan === 'free' && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="flex items-center">
            {user?.plan === 'free' ? (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                Free
              </span>
            ) : (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1">
          <button className="sidebar-item w-full">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="sidebar-item w-full text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
