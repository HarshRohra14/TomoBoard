import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [roomId, setRoomId] = useState('default-room');
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001', {
        auth: {
          token: user.token || localStorage.getItem('accessToken'),
        },
        autoConnect: true,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);

        // Join default whiteboard room
        newSocket.emit('join-whiteboard', roomId);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      // Collaboration event handlers
      newSocket.on('user-joined', (data) => {
        setActiveUsers(prev => {
          const existing = prev.find(u => u.id === data.user.id);
          if (!existing) {
            return [...prev, { ...data.user, joinedAt: new Date() }];
          }
          return prev;
        });
      });

      newSocket.on('user-left', (data) => {
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
      });

      newSocket.on('users-in-room', (users) => {
        setActiveUsers(users.map(u => ({ ...u, joinedAt: new Date() })));
      });

      // Whiteboard collaboration events
      newSocket.on('canvas-updated', (data) => {
        // This will be handled by the whiteboard component
        console.log('Canvas updated by another user:', data);
      });

      newSocket.on('cursor-moved', (data) => {
        // Handle real-time cursor tracking
        console.log('User cursor moved:', data);
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user, roomId]);

  // WebSocket utility functions
  const joinRoom = (newRoomId) => {
    if (socket && isConnected) {
      socket.emit('leave-whiteboard', roomId);
      socket.emit('join-whiteboard', newRoomId);
      setRoomId(newRoomId);
    }
  };

  const sendCanvasUpdate = (operation, objectData) => {
    if (socket && isConnected) {
      socket.emit('canvas-update', {
        whiteboardId: roomId,
        operation,
        objectData,
      });
    }
  };

  const sendCanvasSync = (canvasData) => {
    if (socket && isConnected) {
      socket.emit('canvas-sync', {
        whiteboardId: roomId,
        canvasData,
      });
    }
  };

  const sendCursorPosition = (x, y) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', {
        whiteboardId: roomId,
        x,
        y,
      });
    }
  };

  const sendMessage = (content) => {
    if (socket && isConnected) {
      socket.emit('chat-message', {
        whiteboardId: roomId,
        content,
        type: 'TEXT',
      });
    }
  };

  const value = {
    socket,
    isConnected,
    collaborators,
    activeUsers,
    roomId,
    joinRoom,
    sendCanvasUpdate,
    sendCanvasSync,
    sendCursorPosition,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
