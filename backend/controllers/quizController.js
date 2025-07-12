const Quiz = require('../models/Quiz');
const TestResult = require('../models/TestResult');
const User = require('../models/User');

/**
 * Create a new quiz
 * @route POST /api/quizzes
 * @access Private (Authenticated users only)
 * @description Creates a new quiz with validation for questions and correct answers
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions, timeLimit, tags, settings } = req.body;
    
    // Input validation - Check if required fields are present
    if (!title || !description || !category || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and at least one question are required'
      });
    }
    
    // Validate each question has at least one correct answer
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Check if question text exists
      if (!question.question || question.question.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have text`
        });
      }
      
      // Check if question has options
      if (!question.options || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have at least 2 options`
        });
      }
      
      // Validate that at least one option is marked as correct
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question "${question.question}" must have at least one correct answer`
        });
      }
      
      // Check that all options have text
      const hasEmptyOption = question.options.some(option => !option.text || option.text.trim() === '');
      if (hasEmptyOption) {
        return res.status(400).json({
          success: false,
          message: `All options in question ${i + 1} must have text`
        });
      }
    }
    
    // Create new quiz instance
    const quiz = new Quiz({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty: difficulty || 'Medium',
      questions,
      timeLimit: timeLimit || 30,
      tags: tags || [],
      settings: settings || {},
      creator: req.user._id
    });

    // Save quiz to database
    await quiz.save();
    
    // Add quiz reference to user's created quizzes array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdQuizzes: quiz._id }
    });

    // Return success response with quiz data
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        timeLimit: quiz.timeLimit,
        createdAt: quiz.createdAt
      }
    });
    
  } catch (error) {
    // Handle validation errors and other exceptions
    console.error('Create quiz error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create quiz'
    });
  }
};

/**
 * Get all public quizzes with filtering and pagination
 * @route GET /api/quizzes
 * @access Public
 * @description Retrieves paginated list of public quizzes with optional filtering
 */
const getQuizzes = async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build MongoDB query object for filtering
    let query = { isPublic: true, isActive: true };
    
    // Add category filter if provided
    if (category && category !== '') {
      query.category = category;
    }
    
    // Add difficulty filter if provided
    if (difficulty && difficulty !== '') {
      query.difficulty = difficulty;
    }
    
    // Add text search if provided (requires text index on Quiz model)
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }
    
    // Calculate pagination values
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Limit max results to 50
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort object
    const validSortFields = ['createdAt', 'title', 'totalAttempts', 'averageScore'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with population and projection
    const quizzes = await Quiz.find(query)
      .populate('creator', 'username profile.firstName profile.lastName')
      .select('-questions.options.isCorrect -questions.explanation') // Hide answers from public view
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Quiz.countDocuments(query);
    
    // Format response data
    res.json({
      success: true,
      quizzes: quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        timeLimit: quiz.timeLimit,
        totalAttempts: quiz.totalAttempts || 0,
        averageScore: quiz.averageScore || 0,
        tags: quiz.tags || [],
        creator: quiz.creator,
        createdAt: quiz.createdAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalQuizzes: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum
      }
    });
    
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quizzes'
    });
  }
};

/**
 * Get a single quiz by ID
 * @route GET /api/quizzes/:id
 * @access Public/Private (depends on quiz visibility)
 * @description Retrieves a specific quiz with access control
 */
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }
    
    // Find quiz and populate creator information
    const quiz = await Quiz.findById(id)
      .populate('creator', 'username profile.firstName profile.lastName');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if quiz is inactive
    if (!quiz.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is no longer available'
      });
    }
    
    // Access control: Check if user can access private quiz
    if (!quiz.isPublic && (!req.user || quiz.creator._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this quiz'
      });
    }
    
    // Prepare quiz data for response
    let quizData = quiz.toObject();
    
    // Hide correct answers and explanations for non-creators taking the quiz
    if (!req.user || quiz.creator._id.toString() !== req.user._id.toString()) {
      quizData.questions = quizData.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          text: option.text,
          _id: option._id
        })),
        explanation: undefined // Remove explanation for quiz takers
      }));
    }
    
    res.json({
      success: true,
      quiz: quizData
    });
    
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz'
    });
  }
};

/**
 * Submit quiz answers and calculate results
 * @route POST /api/quizzes/:id/submit
 * @access Private (Authenticated users only)
 * @description Processes quiz submission and calculates score
 */
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    
    // Input validation
    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers array are required'
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if quiz is active
    if (!quiz.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Quiz is not active'
      });
    }
    
    // Check retake policy
    if (quiz.settings && !quiz.settings.allowRetake) {
      const existingResult = await TestResult.findOne({
        user: req.user._id,
        quiz: quizId
      });
      
      if (existingResult) {
        return res.status(400).json({
          success: false,
          message: 'You have already taken this quiz and retakes are not allowed'
        });
      }
    }

    // Initialize scoring variables
    let correctAnswers = 0;
    let earnedPoints = 0;
    const processedAnswers = [];

    // Process each answer and calculate score
    answers.forEach((answer, index) => {
      const question = quiz.questions[index];
      if (!question) return; // Skip if question doesn't exist
      
      // Validate answer format
      if (typeof answer.selectedOption !== 'number' || answer.selectedOption < 0) {
        processedAnswers.push({
          questionId: question._id,
          selectedOption: -1,
          isCorrect: false,
          timeSpent: answer.timeSpent || 0,
          points: 0
        });
        return; // Skip invalid answers
      }
      
      const selectedOption = question.options[answer.selectedOption];
      const isCorrect = selectedOption?.isCorrect || false;
      const points = isCorrect ? (question.points || 1) : 0;
      
      if (isCorrect) correctAnswers++;
      earnedPoints += points;
      
      processedAnswers.push({
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        points
      });
    });

    // Calculate percentage score
    const totalPossiblePoints = quiz.totalPoints || quiz.questions.length;
    const percentage = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;

    // Calculate grade based on percentage
    const calculateGrade = (percentage) => {
      if (percentage >= 97) return 'A+';
      if (percentage >= 93) return 'A';
      if (percentage >= 87) return 'B+';
      if (percentage >= 83) return 'B';
      if (percentage >= 77) return 'C+';
      if (percentage >= 73) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    };

    const grade = calculateGrade(percentage);

    // Create test result record
    const testResult = new TestResult({
      user: req.user._id,
      quiz: quizId,
      answers: processedAnswers,
      score: earnedPoints,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints: totalPossiblePoints,
      earnedPoints,
      timeSpent: timeSpent || 0,
      percentage,
      grade,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await testResult.save();

    // Update user's test results array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { testResults: testResult._id }
    });

    // Update quiz attempt statistics
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: { totalAttempts: 1 }
    });

    // Return success response with results
    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        id: testResult._id,
        score: earnedPoints,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        totalPoints: totalPossiblePoints,
        earnedPoints,
        percentage,
        grade: testResult.grade,
        isPassed: testResult.isPassed,
        timeSpent: timeSpent || 0,
        completedAt: testResult.completedAt
      }
    });
    
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

/**
 * Get current user's created quizzes
 * @route GET /api/quizzes/user/my-quizzes
 * @access Private (Authenticated users only)
 * @description Retrieves paginated list of quizzes created by current user
 */
const getMyQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    // Build query for user's quizzes
    let query = { creator: req.user._id };
    
    // Add status filter if specified
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Fetch user's quizzes with statistics
    const quizzes = await Quiz.find(query)
      .select('title description category difficulty totalAttempts averageScore isPublic isActive createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Quiz.countDocuments(query);
    
    res.json({
      success: true,
      quizzes: quizzes.map(quiz => ({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        totalAttempts: quiz.totalAttempts || 0,
        averageScore: quiz.averageScore || 0,
        isPublic: quiz.isPublic,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalQuizzes: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your quizzes'
    });
  }
};

/**
 * Update an existing quiz
 * @route PUT /api/quizzes/:id
 * @access Private (Quiz creator only)
 * @description Updates quiz details with ownership verification
 */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Verify ownership
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }
    
    // Validate updates if questions are being modified
    if (updates.questions) {
      for (let i = 0; i < updates.questions.length; i++) {
        const question = updates.questions[i];
        const hasCorrectAnswer = question.options?.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have at least one correct answer`
          });
        }
      }
    }
    
    // Perform update with validation
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: {
        id: updatedQuiz._id,
        title: updatedQuiz.title,
        description: updatedQuiz.description,
        category: updatedQuiz.category,
        difficulty: updatedQuiz.difficulty,
        updatedAt: updatedQuiz.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update quiz'
    });
  }
};

/**
 * Delete a quiz
 * @route DELETE /api/quizzes/:id
 * @access Private (Quiz creator only)
 * @description Deletes quiz with ownership verification and cleanup
 */
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }
    
    // Find the quiz
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Verify ownership
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }
    
    // Check if quiz has been taken by users
    const testResultsCount = await TestResult.countDocuments({ quiz: id });
    
    if (testResultsCount > 0) {
      // Instead of deleting, mark as inactive to preserve test results
      await Quiz.findByIdAndUpdate(id, { 
        isActive: false, 
        isPublic: false,
        deletedAt: new Date()
      });
      
      return res.json({
        success: true,
        message: 'Quiz has been deactivated (test results preserved)'
      });
    }
    
    // Safe to delete if no test results exist
    await Quiz.findByIdAndDelete(id);
    
    // Remove from user's created quizzes array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdQuizzes: id }
    });
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
};

/**
 * Get all quiz categories with counts
 * @route GET /api/quizzes/categories
 * @access Public
 * @description Retrieves available quiz categories with quiz counts
 */
const getCategories = async (req, res) => {
  try {
    // Get distinct categories from active public quizzes
    const categories = await Quiz.distinct('category', { 
      isPublic: true, 
      isActive: true 
    });
    
    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Quiz.countDocuments({ 
          category, 
          isPublic: true, 
          isActive: true 
        });
        return { 
          name: category, 
          count,
          slug: category.toLowerCase().replace(/\s+/g, '-')
        };
      })
    );
    
    // Sort by count (descending) then by name
    categoriesWithCount.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      success: true,
      categories: categoriesWithCount,
      totalCategories: categoriesWithCount.length
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
};

// Export all controller functions
module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getMyQuizzes,
  updateQuiz,
  deleteQuiz,
  getCategories
};
