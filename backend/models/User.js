const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  testResults: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestResult'
  }],
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Get user stats
userSchema.methods.getStats = async function() {
  const TestResult = mongoose.model('TestResult');
  const Quiz = mongoose.model('Quiz');
  
  const testResults = await TestResult.find({ user: this._id });
  const createdQuizzes = await Quiz.find({ creator: this._id });
  
  return {
    totalTestsTaken: testResults.length,
    averageScore: testResults.length > 0 
      ? Math.round(testResults.reduce((sum, result) => sum + result.percentage, 0) / testResults.length)
      : 0,
    quizzesCreated: createdQuizzes.length,
    totalQuizAttempts: createdQuizzes.reduce((sum, quiz) => sum + quiz.totalAttempts, 0)
  };
};

module.exports = mongoose.model('User', userSchema);
