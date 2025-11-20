require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const snippetRoutes = require('./routes/snippets');
const runRoute = require('./routes/runRoute');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Queue Worker (BullMQ)
require("./queues/codeWorker");  // <-- starts background worker

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/snippets', snippetRoutes);
app.use('/api/run', runRoute);
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// ------------------------
// Socket setup
// ------------------------

// roomId -> Map(socketId -> username)
const roomUsers = {};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io globally usable
global.io = io;

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // ------------------------
  // Join room
  // ------------------------
  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username || 'Guest';
    socket.roomId = roomId;

    if (!roomUsers[roomId]) roomUsers[roomId] = new Map();

    // Remove previous sockets with same username
    for (const [id, name] of roomUsers[roomId]) {
      if (name === username && id !== socket.id) {
        roomUsers[roomId].delete(id);
      }
    }

    roomUsers[roomId].set(socket.id, socket.username);

    // Emit unique online users
    const userSet = new Set();
    const uniqueUsers = [];
    for (const name of roomUsers[roomId].values()) {
      if (!userSet.has(name)) {
        userSet.add(name);
        uniqueUsers.push(name);
      }
    }

    io.to(roomId).emit('users-list', uniqueUsers.map(name => ({ username: name })));
    console.log(`${socket.username} joined room ${roomId}`);
  });

  // ------------------------
  // Code collaboration
  // ------------------------
  socket.on('code-change', ({ snippetId, code }) => {
    socket.to(snippetId).emit('code-update', code);
  });

  // ------------------------
  // Cursor movement
  // ------------------------
  socket.on('cursor-move', ({ roomId, position, selection }) => {
    socket.to(roomId).emit('cursor-update', {
      userId: socket.id,
      username: socket.username,
      position,
      selection,
      timestamp: Date.now(),
    });
  });

  // ------------------------
  // Leave room
  // ------------------------
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (roomUsers[roomId]) {
      roomUsers[roomId].delete(socket.id);
    }

    // Emit updated unique users
    const userSet = new Set();
    const uniqueUsers = [];
    if (roomUsers[roomId]) {
      for (const name of roomUsers[roomId].values()) {
        if (!userSet.has(name)) {
          userSet.add(name);
          uniqueUsers.push(name);
        }
      }
    }

    io.to(roomId).emit('users-list', uniqueUsers.map(name => ({ username: name })));
    console.log(`${socket.username} left room ${roomId}`);
  });

  // ------------------------
  // Handle disconnect
  // ------------------------
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId && roomUsers[roomId]) {
      roomUsers[roomId].delete(socket.id);

      // Emit updated unique users
      const userSet = new Set();
      const uniqueUsers = [];
      for (const name of roomUsers[roomId].values()) {
        if (!userSet.has(name)) {
          userSet.add(name);
          uniqueUsers.push(name);
        }
      }

      io.to(roomId).emit('users-list', uniqueUsers.map(name => ({ username: name })));
    }

    console.log('🔴 User disconnected:', socket.id);
  });
});

// ------------------------
// MongoDB connect + Start server
// ------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
