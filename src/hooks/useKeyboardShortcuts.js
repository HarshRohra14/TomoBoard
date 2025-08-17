import { useEffect } from 'react';

const useKeyboardShortcuts = ({
  onToggleSidebar,
  onToggleToolbar,
  activeTab,
  disabled = false
}) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      // Check if user is typing in an input field
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true'
      ) {
        return;
      }

      // Sidebar toggle: Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        onToggleSidebar?.();
      }

      // Toolbar toggle (only on whiteboard): Ctrl/Cmd + T
      if ((event.ctrlKey || event.metaKey) && event.key === 't' && activeTab === 'whiteboard') {
        event.preventDefault();
        onToggleToolbar?.();
      }

      // Fullscreen toggle: F11 or Ctrl/Cmd + Shift + F
      if (
        event.key === 'F11' ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F')
      ) {
        event.preventDefault();
        // Toggle both sidebar and toolbar for fullscreen mode
        onToggleSidebar?.();
        if (activeTab === 'whiteboard') {
          onToggleToolbar?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleSidebar, onToggleToolbar, activeTab, disabled]);

  // Return the shortcuts for display purposes
  return {
    shortcuts: [
      {
        keys: ['Ctrl', 'B'],
        description: 'Toggle Sidebar',
        mac: ['⌘', 'B']
      },
      {
        keys: ['Ctrl', 'T'],
        description: 'Toggle Toolbar',
        condition: activeTab === 'whiteboard',
        mac: ['⌘', 'T']
      },
      {
        keys: ['F11'],
        description: 'Toggle Fullscreen',
        alternative: ['Ctrl', 'Shift', 'F'],
        mac: ['⌘', '⇧', 'F']
      }
    ]
  };
};

export default useKeyboardShortcuts;
