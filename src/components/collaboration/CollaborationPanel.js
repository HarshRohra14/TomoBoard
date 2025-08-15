import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Send,
  UserCheck,
  Clock,
  Wifi,
  WifiOff,
  Copy,
  Share2
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

const CollaborationPanel = ({ isOpen, onToggle }) => {
  const { isConnected, activeUsers, sendMessage, roomId } = useWebSocket();
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      userId: 'system',
      userName: 'System',
      message: 'Welcome to the collaboration room!',
      timestamp: new Date().toISOString(),
      isSystem: true
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        userId: 'current-user',
        userName: 'You',
        message: chatMessage,
        timestamp: new Date().toISOString(),
        isOwn: true
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // You could add a toast notification here
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        onClick={onToggle}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-l-lg shadow-lg z-40"
      >
        <Users className="h-5 w-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Collaboration</h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 text-sm">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Disconnected</span>
            </>
          )}
          <div className="ml-auto flex items-center space-x-1">
            <span className="text-gray-600">{activeUsers.length} online</span>
          </div>
        </div>

        {/* Room Info */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Room ID</p>
              <p className="text-sm font-mono text-gray-800">{roomId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyRoomId}
                className="text-gray-400 hover:text-primary-600"
                title="Copy Room ID"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                className="text-gray-400 hover:text-primary-600"
                title="Share Room"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <UserCheck className="h-4 w-4 mr-2" />
          Active Users ({activeUsers.length})
        </h4>
        
        <div className="space-y-2">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  Active now
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
          
          {activeUsers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No other users online
            </p>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </h4>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.isSystem
                    ? 'bg-gray-100 text-gray-600 text-center w-full'
                    : message.isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {!message.isSystem && !message.isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.userName}
                  </p>
                )}
                <p className="text-sm">{message.message}</p>
                <p
                  className={`text-xs mt-1 opacity-75 ${
                    message.isSystem ? 'text-center' : ''
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 input-field text-sm"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!chatMessage.trim() || !isConnected}
              className="btn-primary p-2"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CollaborationPanel;
