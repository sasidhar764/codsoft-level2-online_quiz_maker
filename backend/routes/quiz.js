/* ======  routes/quiz.js  ====== */
const express             = require('express');
const router              = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateQuiz }    = require('../middleware/validation');
const quizController      = require('../controllers/quizController');

/* ---------- PUBLIC ROUTES ---------- */
router.get('/',                 optionalAuth, quizController.getQuizzes);
router.get('/categories',       quizController.getCategories);
router.get('/:id',              optionalAuth, quizController.getQuiz);

/* ---------- PROTECTED ROUTES ---------- */
router.post('/',                protect, validateQuiz, quizController.createQuiz);
router.post('/:id/submit',      protect, quizController.submitQuiz);
router.get('/user/my-quizzes',  protect, quizController.getMyQuizzes);
router.put('/:id',              protect, quizController.updateQuiz);
router.delete('/:id',           protect, quizController.deleteQuiz);

module.exports = router;
