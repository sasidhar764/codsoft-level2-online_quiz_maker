import { VALIDATION_RULES } from './constants';

export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
      errors.push(`Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`);
    }
    if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
      errors.push(`Username cannot exceed ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`);
    }
    if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }
  
  return errors;
};

export const validateEmail = (email) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`);
    }
    if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }
  
  return errors;
};

export const validateQuizTitle = (title) => {
  const errors = [];
  
  if (!title) {
    errors.push('Quiz title is required');
  } else {
    if (title.length < VALIDATION_RULES.QUIZ.TITLE_MIN) {
      errors.push(`Title must be at least ${VALIDATION_RULES.QUIZ.TITLE_MIN} characters`);
    }
    if (title.length > VALIDATION_RULES.QUIZ.TITLE_MAX) {
      errors.push(`Title cannot exceed ${VALIDATION_RULES.QUIZ.TITLE_MAX} characters`);
    }
  }
  
  return errors;
};

export const validateQuizDescription = (description) => {
  const errors = [];
  
  if (!description) {
    errors.push('Quiz description is required');
  } else {
    if (description.length < VALIDATION_RULES.QUIZ.DESCRIPTION_MIN) {
      errors.push(`Description must be at least ${VALIDATION_RULES.QUIZ.DESCRIPTION_MIN} characters`);
    }
    if (description.length > VALIDATION_RULES.QUIZ.DESCRIPTION_MAX) {
      errors.push(`Description cannot exceed ${VALIDATION_RULES.QUIZ.DESCRIPTION_MAX} characters`);
    }
  }
  
  return errors;
};

export const validateQuestion = (question) => {
  const errors = [];
  
  if (!question.question) {
    errors.push('Question text is required');
  }
  
  if (!question.options || question.options.length < VALIDATION_RULES.QUIZ.MIN_OPTIONS) {
    errors.push(`Question must have at least ${VALIDATION_RULES.QUIZ.MIN_OPTIONS} options`);
  }
  
  if (question.options && question.options.length > VALIDATION_RULES.QUIZ.MAX_OPTIONS) {
    errors.push(`Question cannot have more than ${VALIDATION_RULES.QUIZ.MAX_OPTIONS} options`);
  }
  
  const hasCorrectAnswer = question.options?.some(option => option.isCorrect);
  if (!hasCorrectAnswer) {
    errors.push('Question must have at least one correct answer');
  }
  
  return errors;
};

export const validateQuiz = (quiz) => {
  const errors = {};
  
  const titleErrors = validateQuizTitle(quiz.title);
  if (titleErrors.length > 0) errors.title = titleErrors;
  
  const descriptionErrors = validateQuizDescription(quiz.description);
  if (descriptionErrors.length > 0) errors.description = descriptionErrors;
  
  if (!quiz.category) {
    errors.category = ['Category is required'];
  }
  
  if (!quiz.questions || quiz.questions.length < VALIDATION_RULES.QUIZ.MIN_QUESTIONS) {
    errors.questions = [`Quiz must have at least ${VALIDATION_RULES.QUIZ.MIN_QUESTIONS} question`];
  }
  
  if (quiz.questions && quiz.questions.length > VALIDATION_RULES.QUIZ.MAX_QUESTIONS) {
    errors.questions = [`Quiz cannot have more than ${VALIDATION_RULES.QUIZ.MAX_QUESTIONS} questions`];
  }
  
  return errors;
};
