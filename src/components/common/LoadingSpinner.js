import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-sakura-600 dark:border-t-sakura-400 rounded-full mx-auto mb-4"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-8 h-8 border-2 border-gray-100 dark:border-gray-600 border-b-sakura-400 dark:border-b-sakura-300 rounded-full mx-auto mt-2 ml-2"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Loading TomoBoard
          </h2>
          <p className="text-gray-600">
            Preparing your collaborative workspace...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
