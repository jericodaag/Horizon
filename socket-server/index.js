const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
// Configure Socket.io with CORS to allow client connections
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track online users - userId to socketId mapping for direct messaging
const onlineUsers = new Map();

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Socket.io server is running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Associate user ID with socket for online status tracking
  socket.on('identify', (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    // Notify all clients about this user's online status
    io.emit('user_status', {
      userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    console.log('User identified:', userId);
    console.log('Online users:', Array.from(onlineUsers.keys()));

    // Send the current online users list to this newly connected user
    socket.emit('online_users', {
      users: Array.from(onlineUsers.keys()),
      timestamp: new Date().toISOString(),
    });
  });

  // Real-time message relay
  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    // Broadcast to all clients - in production, target only specific recipients
    io.emit('receive_message', data);
  });

  // Handle disconnection and update online status
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      // Notify all clients about this user going offline
      io.emit('user_status', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date().toISOString(),
      });

      console.log('User disconnected:', socket.userId);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
