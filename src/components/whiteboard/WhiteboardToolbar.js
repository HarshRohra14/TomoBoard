import React from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2,
  Pen,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  Undo,
  Redo,
  Download,
  Trash2,
  Palette,
  Settings
} from 'lucide-react';

const WhiteboardToolbar = ({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExport
}) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  const strokeWidths = [1, 2, 4, 6, 8, 12];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-4 h-full">
      {/* Drawing Tools */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                activeTool === tool.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption}
              onClick={() => onColorChange(colorOption)}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                color === colorOption ? 'border-gray-400 dark:border-gray-500 scale-110' : 'border-gray-200 dark:border-gray-600'
              }`}
              style={{ backgroundColor: colorOption }}
              title={colorOption}
            />
          ))}
        </div>
        
        {/* Custom Color Input */}
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-200 dark:border-gray-600 cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Custom</span>
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Stroke Width</h3>
        <div className="space-y-2">
          {strokeWidths.map((width) => (
            <button
              key={width}
              onClick={() => onStrokeWidthChange(width)}
              className={`w-full h-8 rounded-lg border-2 transition-colors flex items-center justify-center ${
                strokeWidth === width
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div
                className="rounded-full bg-gray-800 dark:bg-gray-200"
                style={{
                  width: `${Math.max(width, 2)}px`,
                  height: `${Math.max(width, 2)}px`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={onUndo}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <Undo className="h-4 w-4" />
            <span>Undo</span>
          </button>
          
          <button
            onClick={onRedo}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <Redo className="h-4 w-4" />
            <span>Redo</span>
          </button>
          
          <button
            onClick={onExport}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={onClear}
            className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;
