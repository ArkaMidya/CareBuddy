const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const reportRoutes = require('./routes/reports');
const consultationRoutes = require('./routes/consultations');
const educationRoutes = require('./routes/education');
const campaignRoutes = require('./routes/campaigns');
const feedbackRoutes = require('./routes/feedback');
const referralRoutes = require('./routes/referrals');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://carebody.org', 'https://www.carebody.org']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CareBody Health Ecosystem API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/referrals', referralRoutes);
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server with Socket.IO for real-time notifications
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? ['https://carebody.org', 'https://www.carebody.org'] : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Optional socket auth: extract userId from JWT and join a room per user
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    return next();
  } catch (err) {
    // allow anonymous connections
    return next();
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    socket.join(String(socket.userId));
    console.log(`Socket connected for user ${socket.userId}`);
  }
  socket.on('joinRoom', (room) => {
    if (room) socket.join(room);
  });
});

// Expose io to routes via app.set
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 CareBody Health Ecosystem Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;


