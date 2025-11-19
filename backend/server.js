require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Prometheus
const { httpRequestDuration, register } = require("./metric");

// JWT middleware
const { protect } = require("./middlewares/authMiddleware");

// Routes
const snippetRoutes = require('./routes/snippets');
const runRoute = require('./routes/runRoute');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Queue Worker (BullMQ)
require("./queues/codeWorker");  // starts worker

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());


// PROMETHEUS REQUEST TRACKING MIDDLEWARE
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });

  next();
});


// ⭐ PROMETHEUS METRICS ENDPOINT (PUBLIC, NO JWT)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});


// 🔐 PUBLIC ROUTES (NO JWT REQUIRED)
app.use('/api/auth', authRoutes);    // login, register


// 🔐 PROTECTED ROUTES (JWT REQUIRED)
app.use('/api/snippets', protect, snippetRoutes);
app.use('/api/run', protect, runRoute);
app.use('/api/project', protect, projectRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});


// Socket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io globally accessible
global.io = io;

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


// MongoDB + server start
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
