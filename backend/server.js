require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // required for socket.io
const { Server } = require('socket.io');

const snippetRoutes = require('./routes/snippets');
const runRoute = require('./routes/runRoute');
const authRoutes = require('./routes/authRoutes'); // <-- note the name
const projectRoutes = require('./routes/projectRoutes'); // <-- note the name

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/snippets', snippetRoutes);   // snippets routes
app.use('/api/run', runRoute);             // run code route
app.use('/api/auth', authRoutes);          // auth routes for /register and /login
app.use('/api/project', projectRoutes);          // auth routes for /register and /login

// --- Test route ---
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

// --- Socket.io setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for development
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join-room', (snippetId) => {
    socket.join(snippetId);
    console.log(`User ${socket.id} joined room ${snippetId}`);
  });

  socket.on('code-change', ({ snippetId, code }) => {
    socket.to(snippetId).emit('code-update', code);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
