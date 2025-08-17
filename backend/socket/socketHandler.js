const { authenticateSocketToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Active users and rooms tracking
const activeUsers = new Map(); // socketId -> user info
const whiteboardRooms = new Map(); // whiteboardId -> Set of socketIds
const userCursors = new Map(); // whiteboardId -> Map(userId -> cursor position)

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const user = await authenticateSocketToken(token);
      if (!user) {
        return next(new Error('Invalid authentication token'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.username} connected (${socket.id})`);
    
    // Store user info
    activeUsers.set(socket.id, {
      ...socket.user,
      socketId: socket.id,
      connectedAt: new Date()
    });

    // Join whiteboard room
    socket.on('join-whiteboard', async (whiteboardId) => {
      try {
        // Verify user has access to this whiteboard
        const hasAccess = await verifyWhiteboardAccess(whiteboardId, socket.user.id);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to whiteboard' });
          return;
        }

        // Leave previous rooms
        Array.from(socket.rooms).forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
            leaveWhiteboardRoom(room, socket.id);
          }
        });

        // Join new room
        socket.join(whiteboardId);
        joinWhiteboardRoom(whiteboardId, socket.id);

        // Initialize cursor tracking for this whiteboard
        if (!userCursors.has(whiteboardId)) {
          userCursors.set(whiteboardId, new Map());
        }

        // Notify others in the room
        socket.to(whiteboardId).emit('user-joined', {
          user: {
            id: socket.user.id,
            username: socket.user.username,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            avatar: socket.user.avatar
          },
          timestamp: new Date()
        });

        // Send current active users in this whiteboard
        const activeUsersInRoom = getActiveUsersInRoom(whiteboardId);
        socket.emit('active-users', activeUsersInRoom);

        console.log(`📋 User ${socket.user.username} joined whiteboard ${whiteboardId}`);
      } catch (error) {
        console.error('Error joining whiteboard:', error);
        socket.emit('error', { message: 'Failed to join whiteboard' });
      }
    });

    // Leave whiteboard room
    socket.on('leave-whiteboard', (whiteboardId) => {
      socket.leave(whiteboardId);
      leaveWhiteboardRoom(whiteboardId, socket.id);
      
      // Remove cursor
      if (userCursors.has(whiteboardId)) {
        userCursors.get(whiteboardId).delete(socket.user.id);
      }

      // Notify others
      socket.to(whiteboardId).emit('user-left', {
        user: {
          id: socket.user.id,
          username: socket.user.username
        },
        timestamp: new Date()
      });

      console.log(`📋 User ${socket.user.username} left whiteboard ${whiteboardId}`);
    });

    // Canvas operations
    socket.on('canvas-update', (data) => {
      const { whiteboardId, operation, objectData } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        socket.emit('error', { message: 'Not connected to this whiteboard' });
        return;
      }

      // Broadcast to others in the room
      socket.to(whiteboardId).emit('canvas-update', {
        operation,
        objectData,
        userId: socket.user.id,
        timestamp: new Date()
      });
    });

    // Canvas full sync (for joining users)
    socket.on('canvas-sync', (data) => {
      const { whiteboardId, canvasData } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        socket.emit('error', { message: 'Not connected to this whiteboard' });
        return;
      }

      // Save to database (debounced)
      debouncedSaveCanvas(whiteboardId, canvasData);

      // Broadcast to others in the room
      socket.to(whiteboardId).emit('canvas-sync', {
        canvasData,
        userId: socket.user.id,
        timestamp: new Date()
      });
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      const { whiteboardId, x, y } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        return;
      }

      // Update cursor position
      if (userCursors.has(whiteboardId)) {
        userCursors.get(whiteboardId).set(socket.user.id, { x, y, timestamp: Date.now() });
      }

      // Broadcast to others in the room
      socket.to(whiteboardId).emit('cursor-move', {
        userId: socket.user.id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        x,
        y,
        timestamp: new Date()
      });
    });

    // Chat messages
    socket.on('chat-message', async (data) => {
      const { whiteboardId, content, type = 'TEXT' } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        socket.emit('error', { message: 'Not connected to this whiteboard' });
        return;
      }

      try {
        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            content,
            type,
            userId: socket.user.id,
            whiteboardId
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        });

        // Broadcast to all users in the room (including sender)
        io.to(whiteboardId).emit('chat-message', message);
      } catch (error) {
        console.error('Error saving chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // User typing indicator
    socket.on('typing-start', (data) => {
      const { whiteboardId } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        return;
      }

      socket.to(whiteboardId).emit('typing-start', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    socket.on('typing-stop', (data) => {
      const { whiteboardId } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        return;
      }

      socket.to(whiteboardId).emit('typing-stop', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });

    // Object selection/editing
    socket.on('object-select', (data) => {
      const { whiteboardId, objectId } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        return;
      }

      socket.to(whiteboardId).emit('object-select', {
        objectId,
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date()
      });
    });

    socket.on('object-editing', (data) => {
      const { whiteboardId, objectId, isEditing } = data;
      
      if (!socket.rooms.has(whiteboardId)) {
        return;
      }

      socket.to(whiteboardId).emit('object-editing', {
        objectId,
        userId: socket.user.id,
        username: socket.user.username,
        isEditing,
        timestamp: new Date()
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`👤 User ${socket.user.username} disconnected (${socket.id})`);
      
      // Remove from all rooms
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          leaveWhiteboardRoom(room, socket.id);
          
          // Remove cursor
          if (userCursors.has(room)) {
            userCursors.get(room).delete(socket.user.id);
          }

          // Notify others
          socket.to(room).emit('user-left', {
            user: {
              id: socket.user.id,
              username: socket.user.username
            },
            timestamp: new Date()
          });
        }
      });

      // Remove from active users
      activeUsers.delete(socket.id);
    });
  });

  // Helper functions
  async function verifyWhiteboardAccess(whiteboardId, userId) {
    try {
      const whiteboard = await prisma.whiteboard.findUnique({
        where: { id: whiteboardId },
        include: {
          collaborators: {
            where: { userId }
          }
        }
      });

      if (!whiteboard) return false;
      if (whiteboard.ownerId === userId) return true;
      if (whiteboard.isPublic) return true;
      if (whiteboard.collaborators.length > 0) return true;

      return false;
    } catch (error) {
      console.error('Error verifying whiteboard access:', error);
      return false;
    }
  }

  function joinWhiteboardRoom(whiteboardId, socketId) {
    if (!whiteboardRooms.has(whiteboardId)) {
      whiteboardRooms.set(whiteboardId, new Set());
    }
    whiteboardRooms.get(whiteboardId).add(socketId);
  }

  function leaveWhiteboardRoom(whiteboardId, socketId) {
    if (whiteboardRooms.has(whiteboardId)) {
      whiteboardRooms.get(whiteboardId).delete(socketId);
      if (whiteboardRooms.get(whiteboardId).size === 0) {
        whiteboardRooms.delete(whiteboardId);
        userCursors.delete(whiteboardId);
      }
    }
  }

  function getActiveUsersInRoom(whiteboardId) {
    if (!whiteboardRooms.has(whiteboardId)) return [];
    
    const socketIds = whiteboardRooms.get(whiteboardId);
    return Array.from(socketIds)
      .map(socketId => activeUsers.get(socketId))
      .filter(Boolean)
      .map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        connectedAt: user.connectedAt
      }));
  }

  // Debounced canvas save function
  const canvasSaveTimers = new Map();
  function debouncedSaveCanvas(whiteboardId, canvasData) {
    // Clear existing timer
    if (canvasSaveTimers.has(whiteboardId)) {
      clearTimeout(canvasSaveTimers.get(whiteboardId));
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await prisma.whiteboard.update({
          where: { id: whiteboardId },
          data: { canvasData }
        });
        canvasSaveTimers.delete(whiteboardId);
      } catch (error) {
        console.error('Error saving canvas data:', error);
      }
    }, 2000); // Save after 2 seconds of inactivity

    canvasSaveTimers.set(whiteboardId, timer);
  }

  console.log('🔌 Socket.IO handlers initialized');
};

module.exports = socketHandler;
