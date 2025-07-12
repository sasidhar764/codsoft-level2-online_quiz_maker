const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Trust proxy first
app.set('trust proxy', 1);

// Enhanced CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
}));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many auth attempts' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' }
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quiz Maker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
