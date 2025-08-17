import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import WhiteboardCanvas from '../whiteboard/WhiteboardCanvas';
import WhiteboardToolbar from '../whiteboard/WhiteboardToolbar';
import { Users, Share2 } from 'lucide-react';

const WhiteboardTab = () => {
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const canvasRef = useRef(null);

  const handleCanvasReady = (canvas) => {
    canvasRef.current = canvas;
  };

  const handleUndo = () => {
    // Implementation would depend on canvas history management
    console.log('Undo action');
  };

  const handleRedo = () => {
    // Implementation would depend on canvas history management
    console.log('Redo action');
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = 'white';
      canvasRef.current.renderAll();
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL({
        format: 'png',
        quality: 1.0,
      });
      
      const link = document.createElement('a');
      link.download = `tomoboard-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Toolbar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 sm:w-72 lg:w-80 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-10 flex-shrink-0"
      >
        <WhiteboardToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onExport={handleExport}
        />
      </motion.div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative min-w-0">
        {/* Collaboration Status Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-4 left-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 px-4 py-2"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">3 collaborators</span>
            </div>
            
            <div className="flex -space-x-2">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
                alt="User 1"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2"
                alt="User 2"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user3"
                alt="User 3"
                className="w-6 h-6 rounded-full border-2 border-white"
              />
            </div>

            <button className="btn-primary text-xs px-3 py-1 flex items-center space-x-1">
              <Share2 className="h-3 w-3" />
              <span>Share</span>
            </button>
          </div>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-full"
        >
          <WhiteboardCanvas
            tool={activeTool}
            color={color}
            strokeWidth={strokeWidth}
            onCanvasReady={handleCanvasReady}
          />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 px-4 py-2 max-w-sm z-20 hidden sm:block"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Tip:</strong> Use the toolbar on the left to select different drawing tools.
            Your changes are automatically synced with collaborators in real-time.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WhiteboardTab;
