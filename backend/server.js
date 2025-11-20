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
require("./queues/codeWorker");  // <-- IMPORTANT: starts background worker

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ⭐ Make io globally usable (e.g., workers can emit results)
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

    // broadcast updated users count
    const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
    io.to(roomId).emit('users-update', clients.size);

    // notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username: socket.username,
    });

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
  // Leave room explicitly
  // ------------------------
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
    io.to(roomId).emit('users-update', clients.size);
    socket.to(roomId).emit('user-left', { userId: socket.id });
    console.log(`${socket.username} left room ${roomId}`);
  });

  // ------------------------
  // Handle disconnect
  // ------------------------
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId) {
      const clients = io.sockets.adapter.rooms.get(roomId) || new Set();
      io.to(roomId).emit('users-update', clients.size);
      socket.to(roomId).emit('user-left', { userId: socket.id });
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
