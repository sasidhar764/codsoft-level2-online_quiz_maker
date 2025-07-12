const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
