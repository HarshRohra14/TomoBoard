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
        query: {
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
        },
        autoConnect: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        
        // Join default room
        newSocket.emit('join-room', {
          roomId: roomId,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
        });
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
      socket.emit('leave-room', { roomId: roomId });
      socket.emit('join-room', {
        roomId: newRoomId,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      });
      setRoomId(newRoomId);
    }
  };

  const sendCanvasUpdate = (canvasData) => {
    if (socket && isConnected) {
      socket.emit('canvas-update', {
        roomId: roomId,
        userId: user.id,
        data: canvasData,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const sendCursorPosition = (x, y) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', {
        roomId: roomId,
        userId: user.id,
        x: x,
        y: y,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('chat-message', {
        roomId: roomId,
        userId: user.id,
        userName: user.name,
        message: message,
        timestamp: new Date().toISOString(),
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
    sendCursorPosition,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
