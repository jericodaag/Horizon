const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(
  cors({
    origin: ['https://horizon-eight-lake.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://horizon-eight-lake.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*'],
  },
});

const onlineUsers = new Map();
const typingUsers = new Map();

app.get('/', (req, res) => {
  res.send('Socket.io server is running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('identify', (userId) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    io.emit('user_status', {
      userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    console.log('User identified:', userId);
    console.log('Online users:', Array.from(onlineUsers.keys()));

    socket.emit('online_users', {
      users: Array.from(onlineUsers.keys()),
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    io.emit('receive_message', data);

    // Clear typing indicator when a message is sent
    if (typingUsers.has(`${data.senderId}-${data.receiverId}`)) {
      typingUsers.delete(`${data.senderId}-${data.receiverId}`);
      io.emit('typing_update', {
        senderId: data.senderId,
        receiverId: data.receiverId,
        isTyping: false,
      });
    }
  });

  socket.on('message_read', (data) => {
    console.log('Message read:', data);
    io.emit('read_receipt', data);
  });

  socket.on('typing', (data) => {
    const typingKey = `${data.senderId}-${data.receiverId}`;

    if (data.isTyping) {
      typingUsers.set(typingKey, Date.now());
    } else {
      typingUsers.delete(typingKey);
    }

    io.emit('typing_update', data);

    // Auto-clear typing indicator after inactivity
    if (data.isTyping) {
      setTimeout(() => {
        const lastTyped = typingUsers.get(typingKey);
        if (lastTyped && Date.now() - lastTyped > 3000) {
          typingUsers.delete(typingKey);
          io.emit('typing_update', {
            senderId: data.senderId,
            receiverId: data.receiverId,
            isTyping: false,
          });
        }
      }, 3500);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      // Clear typing indicators for this user
      for (const [key, _] of typingUsers) {
        if (key.startsWith(`${socket.userId}-`)) {
          typingUsers.delete(key);
          const [senderId, receiverId] = key.split('-');
          io.emit('typing_update', {
            senderId,
            receiverId,
            isTyping: false,
          });
        }
      }

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
