const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: Number,
    required: true,
    min: 0
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
});

const testResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz is required']
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  earnedPoints: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    required: true // This field is required
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate grade and isPassed before saving (backup calculation)
testResultSchema.pre('save', function(next) {
  // Only calculate grade if it's not already set
  if (!this.grade) {
    const percentage = this.percentage;
    
    if (percentage >= 97) this.grade = 'A+';
    else if (percentage >= 93) this.grade = 'A';
    else if (percentage >= 87) this.grade = 'B+';
    else if (percentage >= 83) this.grade = 'B';
    else if (percentage >= 77) this.grade = 'C+';
    else if (percentage >= 73) this.grade = 'C';
    else if (percentage >= 60) this.grade = 'D';
    else this.grade = 'F';
  }
  
  // Set isPassed based on percentage
  this.isPassed = this.percentage >= 60;
  
  next();
});

// Index for better query performance
testResultSchema.index({ user: 1, completedAt: -1 });
testResultSchema.index({ quiz: 1, completedAt: -1 });
testResultSchema.index({ user: 1, quiz: 1 });

module.exports = mongoose.model('TestResult', testResultSchema);
