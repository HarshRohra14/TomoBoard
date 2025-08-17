import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const ShortcutsIndicator = ({ shortcuts = [], className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const getKeyDisplay = (shortcut) => {
    const keys = isMac && shortcut.mac ? shortcut.mac : shortcut.keys;
    return keys;
  };

  const filteredShortcuts = shortcuts.filter(shortcut => 
    !shortcut.condition || shortcut.condition === true
  );

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(!isVisible)}
        className={`
          p-2 rounded-xl bg-gray-50 dark:bg-gray-800 
          hover:bg-gray-100 dark:hover:bg-gray-700
          border border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-400
          transition-all duration-200
          ${className}
        `}
        title="Keyboard Shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </motion.button>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => setIsVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 m-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-3">
                {filteredShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getKeyDisplay(shortcut).map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="
                            px-2 py-1 text-xs font-medium
                            bg-white dark:bg-gray-800
                            border border-gray-300 dark:border-gray-600
                            rounded-md shadow-sm
                            text-gray-700 dark:text-gray-300
                          "
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Alternative shortcuts */}
                {filteredShortcuts.some(s => s.alternative) && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Alternative shortcuts:
                    </p>
                    {filteredShortcuts
                      .filter(s => s.alternative)
                      .map((shortcut, index) => (
                        <div
                          key={`alt-${index}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 dark:bg-gray-700/25"
                        >
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center space-x-1">
                            {shortcut.alternative.map((key, keyIndex) => (
                              <kbd
                                key={keyIndex}
                                className="
                                  px-1.5 py-0.5 text-xs font-medium
                                  bg-white dark:bg-gray-800
                                  border border-gray-300 dark:border-gray-600
                                  rounded shadow-sm
                                  text-gray-600 dark:text-gray-400
                                "
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShortcutsIndicator;
