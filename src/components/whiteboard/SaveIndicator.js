import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SaveIndicator = ({ className = '' }) => {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(new Date());

  useEffect(() => {
    // Listen for canvas changes
    const handleStorageChange = () => {
      setSaveStatus('saving');
      
      // Simulate save completion
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSaved(new Date());
      }, 1000);
    };

    // Listen for localStorage changes (when canvas is saved)
    window.addEventListener('storage', handleStorageChange);
    
    // Check for manual saves
    const checkInterval = setInterval(() => {
      const savedData = localStorage.getItem('tomoboard_canvas_data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.timestamp) {
            setLastSaved(new Date(data.timestamp));
          }
        } catch (error) {
          console.error('Error parsing saved data:', error);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Clock className="h-3 w-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Check className="h-3 w-3 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      default:
        return `Saved ${formatTime(lastSaved)}`;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs
          bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
          border border-gray-200/50 dark:border-gray-700/50
          shadow-sm
          ${className}
        `}
      >
        {getStatusIcon()}
        <span className={`
          ${saveStatus === 'error' ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}
        `}>
          {getStatusText()}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default SaveIndicator;
