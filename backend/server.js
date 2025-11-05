require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // required for socket.io
const { Server } = require('socket.io');
const snippetRoutes = require('./routes/snippets');
const runRoute = require('./routes/runRoute');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/snippets', snippetRoutes);
app.use('/api', runRoute);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // or http://localhost:5173 for safety
    methods: ["GET", "POST"]
  }
});

// --- Socket.io logic ---
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // When user joins a snippet room
  socket.on('join-room', (snippetId) => {
    socket.join(snippetId);
    console.log(`User ${socket.id} joined room ${snippetId}`);
  });

  // When a user edits code
  socket.on('code-change', ({ snippetId, code }) => {
    // broadcast to everyone *except* the sender
    socket.to(snippetId).emit('code-update', code);
  });

  // When user disconnects
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo connected'); 
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error(err));
