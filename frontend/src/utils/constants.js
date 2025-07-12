export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  QUIZ: {
    GET_ALL: '/quizzes',
    GET_BY_ID: '/quizzes',
    CREATE: '/quizzes',
    UPDATE: '/quizzes',
    DELETE: '/quizzes',
    SUBMIT: '/quizzes',
    MY_QUIZZES: '/quizzes/user/my-quizzes',
    CATEGORIES: '/quizzes/categories'
  },
  DASHBOARD: {
    GET: '/dashboard',
    RESULTS: '/dashboard/results',
    HISTORY: '/dashboard/history'
  }
};

export const QUIZ_CATEGORIES = [
  'Technology',
  'Science',
  'History',
  'Sports',
  'General Knowledge',
  'Mathematics',
  'Literature',
  'Geography',
  'Arts',
  'Business'
];

export const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy', color: '#10b981' },
  { value: 'Medium', label: 'Medium', color: '#f59e0b' },
  { value: 'Hard', label: 'Hard', color: '#ef4444' }
];

export const GRADE_COLORS = {
  'A+': '#10b981',
  'A': '#059669',
  'B+': '#3b82f6',
  'B': '#2563eb',
  'C+': '#f59e0b',
  'C': '#d97706',
  'D': '#ef4444',
  'F': '#dc2626'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  QUIZ_DRAFT: 'quiz_draft'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  QUIZ: {
    TITLE_MIN: 5,
    TITLE_MAX: 100,
    DESCRIPTION_MIN: 10,
    DESCRIPTION_MAX: 1000,
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 50,
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 6
  }
};
