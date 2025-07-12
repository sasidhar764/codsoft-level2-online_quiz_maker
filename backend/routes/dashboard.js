const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserDashboard,
  getTestResult,
  getTestHistory
} = require('../controllers/dashboardController');

// All dashboard routes are protected
router.get('/', protect, getUserDashboard);
router.get('/results/:resultId', protect, getTestResult);
router.get('/history', protect, getTestHistory);

module.exports = router;
