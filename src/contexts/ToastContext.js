import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showToggleToast = useCallback((action, target, isVisible) => {
    const titles = {
      show: {
        sidebar: 'Sidebar Shown',
        toolbar: 'Toolbar Shown'
      },
      hide: {
        sidebar: 'Sidebar Hidden',
        toolbar: 'Toolbar Hidden'
      }
    };

    const messages = {
      show: {
        sidebar: 'Navigation sidebar is now visible',
        toolbar: 'Drawing toolbar is now visible'
      },
      hide: {
        sidebar: 'More space for content',
        toolbar: 'More space for canvas'
      }
    };

    const type = isVisible ? 'toggle-show' : 'toggle-hide';
    const actionKey = isVisible ? 'show' : 'hide';

    return addToast({
      type,
      title: titles[actionKey][target],
      message: messages[actionKey][target],
      duration: 2000,
      position: 'bottom-right'
    });
  }, [addToast]);

  const showKeyboardShortcutToast = useCallback((shortcut, action) => {
    return addToast({
      type: 'info',
      title: `Keyboard Shortcut`,
      message: `${action} with ${shortcut}`,
      duration: 1500,
      position: 'bottom-right'
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showToggleToast,
    showKeyboardShortcutToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
