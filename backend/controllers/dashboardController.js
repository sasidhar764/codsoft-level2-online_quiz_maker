const TestResult = require('../models/TestResult');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get user dashboard with comprehensive statistics
 * @route GET /api/dashboard
 * @access Private
 */
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's recent test results (last 10)
    const recentTests = await TestResult.find({ user: userId })
      .populate('quiz', 'title category difficulty totalPoints')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    // Get user's created quizzes with real-time statistics
    const createdQuizzes = await Quiz.aggregate([
      { $match: { creator: userId } },
      {
        $lookup: {
          from: 'testresults',
          localField: '_id',
          foreignField: 'quiz',
          as: 'testResults'
        }
      },
      {
        $addFields: {
          totalAttempts: { $size: '$testResults' },
          averageScore: {
            $cond: [
              { $gt: [{ $size: '$testResults' }, 0] },
              { $round: [{ $avg: '$testResults.percentage' }, 0] },
              0
            ]
          }
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          difficulty: 1,
          isPublic: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          totalAttempts: 1,
          averageScore: 1,
          questions: { $size: '$questions' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Calculate overall user statistics
    const totalTestsTaken = await TestResult.countDocuments({ user: userId });
    const totalQuizzesCreated = createdQuizzes.length;

    // Calculate user's average score across all tests
    const avgScoreResult = await TestResult.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ]);
    const averageScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // Calculate total attempts on user's created quizzes
    const totalQuizAttempts = createdQuizzes.reduce((sum, quiz) => sum + (quiz.totalAttempts || 0), 0);

    // Count public vs private quizzes
    const publicQuizzes = createdQuizzes.filter(quiz => quiz.isPublic).length;
    const privateQuizzes = totalQuizzesCreated - publicQuizzes;

    // Get category performance analysis
    const categoryPerformance = await TestResult.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      { $unwind: '$quizData' },
      {
        $group: {
          _id: '$quizData.category',
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$percentage' },
          totalPoints: { $sum: '$earnedPoints' }
        }
      },
      {
        $project: {
          category: '$_id',
          _id: 0,
          averageScore: { $round: ['$averageScore', 0] },
          bestScore: { $round: ['$bestScore', 0] },
          totalAttempts: 1,
          totalPoints: 1
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await TestResult.find({
      user: userId,
      completedAt: { $gte: thirtyDaysAgo }
    })
      .populate('quiz', 'title category')
      .sort({ completedAt: -1 })
      .limit(5)
      .lean();

    // Get performance trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const performanceTrends = await TestResult.aggregate([
      {
        $match: {
          user: userId,
          completedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          averageScore: { $avg: '$percentage' },
          totalTests: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          averageScore: { $round: ['$averageScore', 0] },
          totalTests: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Calculate achievements/badges
    const achievements = [];

    if (totalTestsTaken >= 1) achievements.push({
      name: 'First Steps',
      description: 'Completed your first quiz',
      icon: '🎯',
      earnedAt: recentTests[recentTests.length - 1]?.completedAt
    });

    if (totalTestsTaken >= 10) achievements.push({
      name: 'Quiz Enthusiast',
      description: 'Completed 10+ quizzes',
      icon: '📚',
      earnedAt: new Date()
    });

    if (totalTestsTaken >= 50) achievements.push({
      name: 'Quiz Master',
      description: 'Completed 50+ quizzes',
      icon: '🏆',
      earnedAt: new Date()
    });

    if (averageScore >= 80) achievements.push({
      name: 'High Achiever',
      description: 'Maintained 80%+ average score',
      icon: '⭐',
      earnedAt: new Date()
    });

    if (averageScore >= 95) achievements.push({
      name: 'Perfectionist',
      description: 'Maintained 95%+ average score',
      icon: '💎',
      earnedAt: new Date()
    });

    if (totalQuizzesCreated >= 1) achievements.push({
      name: 'Content Creator',
      description: 'Created your first quiz',
      icon: '✏️',
      earnedAt: createdQuizzes[createdQuizzes.length - 1]?.createdAt
    });

    if (totalQuizzesCreated >= 5) achievements.push({
      name: 'Quiz Creator',
      description: 'Created 5+ quizzes',
      icon: '🎨',
      earnedAt: new Date()
    });

    if (totalQuizzesCreated >= 20) achievements.push({
      name: 'Prolific Creator',
      description: 'Created 20+ quizzes',
      icon: '🚀',
      earnedAt: new Date()
    });

    if (totalQuizAttempts >= 100) achievements.push({
      name: 'Popular Creator',
      description: 'Your quizzes have 100+ attempts',
      icon: '🌟',
      earnedAt: new Date()
    });

    // Format response
    res.json({
      success: true,
      dashboard: {
        overview: {
          totalTestsTaken,
          totalQuizzesCreated,
          averageScore,
          totalQuizAttempts,
          publicQuizzes,
          privateQuizzes
        },
        recentTests: recentTests.map(result => ({
          id: result._id,
          quizTitle: result.quiz?.title || 'Unknown Quiz',
          category: result.quiz?.category || 'Unknown',
          difficulty: result.quiz?.difficulty || 'Unknown',
          score: result.earnedPoints,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          grade: result.grade,
          isPassed: result.isPassed,
          completedAt: result.completedAt,
          timeSpent: result.timeSpent
        })),
        createdQuizzes: createdQuizzes.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.questions,
          totalAttempts: quiz.totalAttempts,
          averageScore: quiz.averageScore,
          isPublic: quiz.isPublic,
          isActive: quiz.isActive,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        })),
        categoryPerformance,
        recentActivity: recentActivity.map(activity => ({
          id: activity._id,
          quizTitle: activity.quiz?.title || 'Unknown Quiz',
          category: activity.quiz?.category || 'Unknown',
          percentage: activity.percentage,
          grade: activity.grade,
          completedAt: activity.completedAt
        })),
        performanceTrends,
        achievements
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get detailed test result
 * @route GET /api/dashboard/results/:resultId
 * @access Private
 */
const getTestResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result ID format'
      });
    }

    const result = await TestResult.findById(resultId)
      .populate({
        path: 'quiz',
        select: 'title category difficulty questions creator',
        populate: {
          path: 'creator',
          select: 'username profile.firstName profile.lastName'
        }
      })
      .populate('user', 'username profile.firstName profile.lastName')
      .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Test result not found'
      });
    }

    // Check if user owns this result or created the quiz
    const isOwner = result.user._id.toString() === req.user._id.toString();
    const isCreator = result.quiz?.creator?._id.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this result'
      });
    }

    // Add detailed question analysis
    const detailedAnswers = result.answers.map((answer, index) => {
      const question = result.quiz?.questions?.find(q => 
        q._id.toString() === answer.questionId.toString()
      );

      if (!question) {
        return {
          questionNumber: index + 1,
          question: 'Question not found',
          selectedOption: answer.selectedOption,
          selectedText: 'Option not found',
          correctOption: -1,
          correctText: 'Correct answer not found',
          isCorrect: answer.isCorrect,
          points: answer.points,
          timeSpent: answer.timeSpent,
          explanation: null
        };
      }

      const selectedOption = question.options[answer.selectedOption];
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
      const correctOption = question.options[correctOptionIndex];

      return {
        questionNumber: index + 1,
        question: question.question,
        selectedOption: answer.selectedOption,
        selectedText: selectedOption?.text || 'Option not found',
        correctOption: correctOptionIndex,
        correctText: correctOption?.text || 'Correct answer not found',
        allOptions: question.options.map(opt => opt.text),
        isCorrect: answer.isCorrect,
        points: answer.points,
        timeSpent: answer.timeSpent,
        explanation: question.explanation
      };
    });

    // Calculate additional statistics
    const totalTimeSpent = result.timeSpent;
    const averageTimePerQuestion = Math.round(totalTimeSpent / result.totalQuestions);
    const accuracyRate = Math.round((result.correctAnswers / result.totalQuestions) * 100);

    res.json({
      success: true,
      result: {
        id: result._id,
        quiz: {
          id: result.quiz?._id,
          title: result.quiz?.title || 'Unknown Quiz',
          category: result.quiz?.category || 'Unknown',
          difficulty: result.quiz?.difficulty || 'Unknown',
          creator: result.quiz?.creator
        },
        user: {
          id: result.user._id,
          username: result.user.username,
          name: result.user.profile?.firstName && result.user.profile?.lastName
            ? `${result.user.profile.firstName} ${result.user.profile.lastName}`
            : result.user.username
        },
        score: result.earnedPoints,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        grade: result.grade,
        isPassed: result.isPassed,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.totalQuestions - result.correctAnswers,
        timeSpent: totalTimeSpent,
        averageTimePerQuestion,
        accuracyRate,
        completedAt: result.completedAt,
        detailedAnswers
      }
    });

  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve test result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get user's test history with filtering and pagination
 * @route GET /api/dashboard/history
 * @access Private
 */
const getTestHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      startDate,
      endDate,
      sortBy = 'completedAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build match stage for aggregation
    let matchStage = { user: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) {
        matchStage.completedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.completedAt.$lte = new Date(endDate);
      }
    }

    // Build aggregation pipeline
    let pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      { $unwind: '$quizData' }
    ];

    // Add category filter if provided
    if (category) {
      pipeline.push({ $match: { 'quizData.category': category } });
    }

    // Add difficulty filter if provided
    if (difficulty) {
      pipeline.push({ $match: { 'quizData.difficulty': difficulty } });
    }

    // Add sorting
    const validSortFields = ['completedAt', 'percentage', 'timeSpent', 'earnedPoints'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'completedAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    pipeline.push({ $sort: { [sortField]: sortDirection } });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await TestResult.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination to main pipeline
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    // Execute aggregation
    const results = await TestResult.aggregate(pipeline);

    // Get category statistics for filters
    const categoryStats = await TestResult.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      { $unwind: '$quizData' },
      {
        $group: {
          _id: '$quizData.category',
          count: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          averageScore: { $round: ['$averageScore', 1] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      results: results.map(result => ({
        id: result._id,
        quiz: {
          id: result.quizData._id,
          title: result.quizData.title,
          category: result.quizData.category,
          difficulty: result.quizData.difficulty
        },
        score: result.earnedPoints,
        totalPoints: result.totalPoints,
        percentage: result.percentage,
        grade: result.grade,
        isPassed: result.isPassed,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum
      },
      filters: {
        categories: categoryStats,
        availableDifficulties: ['Easy', 'Medium', 'Hard']
      },
      summary: {
        totalTests: total,
        averageScore: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
          : 0,
        totalTimeSpent: results.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve test history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get user's performance analytics
 * @route GET /api/dashboard/analytics
 * @access Private
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get performance over time
    const performanceOverTime = await TestResult.aggregate([
      {
        $match: {
          user: userId,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt'
            }
          },
          averageScore: { $avg: '$percentage' },
          totalTests: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      },
      {
        $project: {
          date: '$_id',
          averageScore: { $round: ['$averageScore', 1] },
          totalTests: 1,
          totalTimeSpent: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get difficulty analysis
    const difficultyAnalysis = await TestResult.aggregate([
      {
        $match: {
          user: userId,
          completedAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizData'
        }
      },
      { $unwind: '$quizData' },
      {
        $group: {
          _id: '$quizData.difficulty',
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$percentage' },
          worstScore: { $min: '$percentage' }
        }
      },
      {
        $project: {
          difficulty: '$_id',
          averageScore: { $round: ['$averageScore', 1] },
          totalAttempts: 1,
          bestScore: { $round: ['$bestScore', 1] },
          worstScore: { $round: ['$worstScore', 1] },
          _id: 0
        }
      }
    ]);

    // Get time analysis
    const timeAnalysis = await TestResult.aggregate([
      {
        $match: {
          user: userId,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          averageTimePerQuiz: { $avg: '$timeSpent' },
          totalTimeSpent: { $sum: '$timeSpent' },
          fastestCompletion: { $min: '$timeSpent' },
          slowestCompletion: { $max: '$timeSpent' }
        }
      },
      {
        $project: {
          averageTimePerQuiz: { $round: ['$averageTimePerQuiz', 0] },
          totalTimeSpent: 1,
          fastestCompletion: 1,
          slowestCompletion: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        timeframe,
        performanceOverTime,
        difficultyAnalysis,
        timeAnalysis: timeAnalysis[0] || {
          averageTimePerQuiz: 0,
          totalTimeSpent: 0,
          fastestCompletion: 0,
          slowestCompletion: 0
        }
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getUserDashboard,
  getTestResult,
  getTestHistory,
  getUserAnalytics
};
