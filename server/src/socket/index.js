const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Squad = require('../models/Squad');
const messageService = require('../services/messageService');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('name profilePhoto');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join a squad chat room
    socket.on('join_room', async ({ squadId }) => {
      try {
        const squad = await Squad.findById(squadId);
        if (!squad) return socket.emit('error', { message: 'Squad not found' });

        const isMember = squad.members.some(m => m.toString() === socket.user._id.toString());
        if (!isMember) return socket.emit('error', { message: 'Not a squad member' });

        socket.join(squad.chatRoom);
        socket.currentRoom = squad.chatRoom;
        socket.currentSquadId = squadId;

        // Notify others
        socket.to(squad.chatRoom).emit('user_joined', {
          user: { _id: socket.user._id, name: socket.user.name, profilePhoto: socket.user.profilePhoto },
          message: `${socket.user.name} joined the chat`,
          timestamp: new Date(),
        });

        console.log(`💬 ${socket.user.name} joined room: ${squad.chatRoom}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave a squad chat room
    socket.on('leave_room', ({ squadId }) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user_left', {
          user: { _id: socket.user._id, name: socket.user.name },
          message: `${socket.user.name} left the chat`,
          timestamp: new Date(),
        });
        socket.leave(socket.currentRoom);
        socket.currentRoom = null;
        socket.currentSquadId = null;
      }
    });

    // Send a message
    socket.on('send_message', async ({ squadId, content }) => {
      try {
        if (!content?.trim()) return;

        const message = await messageService.saveMessage({
          squadId,
          senderId: socket.user._id,
          content: content.trim(),
        });

        io.to(`squad_${squadId}`).emit('new_message', {
          _id: message._id,
          content: message.content,
          sender: message.sender,
          squad: squadId,
          createdAt: message.createdAt,
          type: message.type,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing_start', ({ squadId }) => {
      socket.to(`squad_${squadId}`).emit('user_typing', {
        user: { _id: socket.user._id, name: socket.user.name },
      });
    });

    socket.on('typing_stop', ({ squadId }) => {
      socket.to(`squad_${squadId}`).emit('user_stopped_typing', {
        userId: socket.user._id,
      });
    });

    // Itinerary update broadcast
    socket.on('itinerary_updated', ({ squadId, itinerary }) => {
      socket.to(`squad_${squadId}`).emit('itinerary_update', {
        itinerary,
        updatedBy: { _id: socket.user._id, name: socket.user.name },
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
