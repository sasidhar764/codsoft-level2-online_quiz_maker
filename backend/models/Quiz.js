const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [200, 'Option text cannot exceed 200 characters']
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1'],
    max: [10, 'Points cannot exceed 10']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
});

// Validate that at least one option is correct
questionSchema.pre('save', function(next) {
  const hasCorrectAnswer = this.options.some(option => option.isCorrect);
  if (!hasCorrectAnswer) {
    return next(new Error('At least one option must be marked as correct'));
  }
  
  if (this.options.length < 2) {
    return next(new Error('Question must have at least 2 options'));
  }
  
  if (this.options.length > 6) {
    return next(new Error('Question cannot have more than 6 options'));
  }
  
  next();
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Technology', 'Science', 'History', 'Sports', 'General Knowledge', 'Mathematics', 'Literature', 'Geography', 'Arts', 'Business'],
      message: 'Category must be one of the predefined options'
    }
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(questions) {
        return questions.length >= 1 && questions.length <= 50;
      },
      message: 'Quiz must have between 1 and 50 questions'
    }
  },
  timeLimit: {
    type: Number,
    default: 30,
    min: [5, 'Time limit must be at least 5 minutes'],
    max: [180, 'Time limit cannot exceed 180 minutes']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    allowRetake: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
  next();
});

// Index for better search performance
quizSchema.index({ category: 1, isPublic: 1, isActive: 1 });
quizSchema.index({ creator: 1 });
quizSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate average score method
quizSchema.methods.calculateAverageScore = async function() {
  const TestResult = mongoose.model('TestResult');
  const results = await TestResult.find({ quiz: this._id });
  
  if (results.length === 0) return 0;
  
  const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
  return Math.round(totalScore / results.length);
};

// Update quiz statistics
quizSchema.methods.updateStats = async function() {
  this.averageScore = await this.calculateAverageScore();
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
