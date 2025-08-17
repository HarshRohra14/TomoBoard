import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Info, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Menu,
  PanelLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 3000, 
  position = 'bottom-right',
  onClose,
  action = null
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return Check;
      case 'error':
        return X;
      case 'warning':
        return AlertTriangle;
      case 'toggle-show':
        return Eye;
      case 'toggle-hide':
        return EyeOff;
      case 'sidebar':
        return Menu;
      case 'toolbar':
        return PanelLeft;
      case 'fullscreen':
        return Maximize2;
      case 'windowed':
        return Minimize2;
      default:
        return Info;
    }
  };

  const getStyles = () => {
    const baseStyles = `
      rounded-xl shadow-lg border backdrop-blur-sm
      max-w-sm w-full overflow-hidden
    `;

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200`;
      case 'toggle-show':
      case 'toggle-hide':
      case 'sidebar':
      case 'toolbar':
      case 'fullscreen':
      case 'windowed':
        return `${baseStyles} bg-sakura-50/90 dark:bg-sakura-900/20 border-sakura-200 dark:border-sakura-800 text-sakura-800 dark:text-sakura-200`;
      default:
        return `${baseStyles} bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200`;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed z-50 ${getPositionStyles()}`}
    >
      <div className={getStyles()}>
        <div className="flex items-start p-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {title && (
              <h4 className="text-sm font-medium mb-1">
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm opacity-90">
                {message}
              </p>
            )}
          </div>

          {/* Action */}
          {action && (
            <div className="ml-3">
              <button
                onClick={action.onClick}
                className="text-xs font-medium underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity"
              >
                {action.label}
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => onClose?.(id)}
            className="ml-2 flex-shrink-0 rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <motion.div
            className="h-1 bg-current opacity-30"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        )}
      </div>
    </motion.div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts = [], onClose }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;
