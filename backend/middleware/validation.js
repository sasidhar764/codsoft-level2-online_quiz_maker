const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateQuiz = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .isIn(['Technology', 'Science', 'History', 'Sports', 'General Knowledge', 'Mathematics', 'Literature', 'Geography', 'Arts', 'Business'])
    .withMessage('Invalid category'),
  
  body('questions')
    .isArray({ min: 1, max: 50 })
    .withMessage('Quiz must have between 1 and 50 questions'),
  
  body('questions.*.question')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be between 10 and 500 characters'),
  
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateQuiz,
  handleValidationErrors
};
