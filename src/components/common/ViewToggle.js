import React from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  PanelLeft, 
  PanelLeftClose,
  Eye,
  EyeOff,
  Layout,
  Maximize2,
  Minimize2
} from 'lucide-react';

const ViewToggle = ({ 
  type = 'sidebar', // 'sidebar' | 'toolbar' | 'fullscreen'
  isVisible, 
  onToggle, 
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'modern', // 'modern' | 'minimal' | 'pill'
  showLabel = false,
  disabled = false,
  className = ''
}) => {
  const getIcons = () => {
    switch (type) {
      case 'sidebar':
        return {
          visible: Menu,
          hidden: Menu
        };
      case 'toolbar':
        return {
          visible: PanelLeft,
          hidden: PanelLeftClose
        };
      case 'fullscreen':
        return {
          visible: Minimize2,
          hidden: Maximize2
        };
      default:
        return {
          visible: Eye,
          hidden: EyeOff
        };
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'sidebar':
        return isVisible ? 'Hide Menu' : 'Show Menu';
      case 'toolbar':
        return isVisible ? 'Hide Toolbar' : 'Show Toolbar';
      case 'fullscreen':
        return isVisible ? 'Exit Fullscreen' : 'Fullscreen';
      default:
        return isVisible ? 'Hide' : 'Show';
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'w-8 h-8',
          icon: 'h-3.5 w-3.5',
          text: 'text-xs'
        };
      case 'lg':
        return {
          button: 'w-12 h-12',
          icon: 'h-6 w-6',
          text: 'text-sm'
        };
      default:
        return {
          button: 'w-10 h-10',
          icon: 'h-4 w-4',
          text: 'text-sm'
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = `
      relative overflow-hidden
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2
      dark:focus:ring-offset-background-dark
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (variant) {
      case 'minimal':
        return `${baseStyles}
          bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
          border border-transparent hover:border-gray-200 dark:hover:border-gray-700
          rounded-lg
        `;
      case 'pill':
        return `${baseStyles}
          ${isVisible 
            ? 'bg-sakura-100 dark:bg-sakura-900/30 text-sakura-700 dark:text-sakura-300 border-sakura-200 dark:border-sakura-800' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
          }
          border rounded-full
          hover:scale-105 active:scale-95
        `;
      default: // modern
        return `${baseStyles}
          ${isVisible 
            ? 'bg-sakura-50 dark:bg-sakura-900/20 text-sakura-600 dark:text-sakura-400 border-sakura-200 dark:border-sakura-800' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
          }
          border rounded-xl shadow-sm hover:shadow-md
          hover:border-sakura-300 dark:hover:border-sakura-700
          backdrop-blur-sm
        `;
    }
  };

  const icons = getIcons();
  const sizes = getSizes();
  const IconComponent = isVisible ? icons.visible : icons.hidden;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onToggle}
      className={`
        ${getVariantStyles()}
        ${sizes.button}
        ${className}
        group
      `}
      title={getLabel()}
      disabled={disabled}
    >
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-sakura-500/10 to-sakura-600/10 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isVisible ? 1 : 0, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Icon with rotation animation */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={{ 
          rotate: type === 'sidebar' && !isVisible ? 180 : 0,
          scale: 1
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <IconComponent className={`${sizes.icon} transition-transform duration-300`} />
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-sakura-400/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: [0, 1, 0] }}
        transition={{ duration: 0.4 }}
      />

      {/* Label */}
      {showLabel && (
        <motion.span
          className={`
            absolute -bottom-8 left-1/2 transform -translate-x-1/2
            ${sizes.text} font-medium
            bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
            px-2 py-1 rounded-md whitespace-nowrap
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            pointer-events-none
          `}
        >
          {getLabel()}
        </motion.span>
      )}
    </motion.button>
  );
};

export default ViewToggle;
