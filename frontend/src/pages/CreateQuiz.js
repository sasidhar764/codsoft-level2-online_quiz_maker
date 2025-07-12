import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateQuiz } from '../hooks/useQuiz';
import { QUIZ_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';
import toast from 'react-hot-toast';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Medium',
    timeLimit: 30,
    questions: [
      {
        question: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        explanation: '',
        points: 1
      }
    ],
    tags: [],
    isPublic: true
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const createQuizMutation = useCreateQuiz();
  const navigate = useNavigate();

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          explanation: '',
          points: 1
        }
      ]
    }));
  };

  const removeQuestion = (questionIndex) => {
    if (quiz.questions.length > 1) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[questionIndex].options.length < 6) {
      updatedQuestions[questionIndex].options.push({
        text: '',
        isCorrect: false
      });
      setQuiz(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuiz(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }
    
    if (!quiz.description.trim()) {
      toast.error('Quiz description is required');
      return false;
    }
    
    if (!quiz.category) {
      toast.error('Please select a category');
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error(`Question ${i + 1} must have at least one correct answer`);
        return false;
      }
      
      const hasEmptyOption = question.options.some(option => !option.text.trim());
      if (hasEmptyOption) {
        toast.error(`All options in Question ${i + 1} must have text`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateQuiz()) return;

    setIsLoading(true);
    try {
      await createQuizMutation.mutateAsync(quiz);
      toast.success('Quiz created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-quiz-page">
      <div className="create-quiz-container">
        <div className="create-quiz-header">
          <h1 className="create-quiz-title">Create New Quiz</h1>
          <p className="create-quiz-subtitle">Design an engaging quiz for your audience</p>
        </div>

        <div className="quiz-progress-indicator">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="quiz-form">
          {/* Quiz Basic Info */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Quiz Information</h2>
              <span className="section-badge">Step 1</span>
            </div>
            
            <div className="form-group">
              <label className="form-label required">Quiz Title</label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => handleQuizChange('title', e.target.value)}
                className="form-input"
                placeholder="Enter an engaging quiz title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Description</label>
              <textarea
                value={quiz.description}
                onChange={(e) => handleQuizChange('description', e.target.value)}
                className="form-textarea"
                placeholder="Describe what this quiz is about and what participants will learn"
                rows={4}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Category</label>
                <select
                  value={quiz.category}
                  onChange={(e) => handleQuizChange('category', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select category</option>
                  {QUIZ_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  value={quiz.difficulty}
                  onChange={(e) => handleQuizChange('difficulty', e.target.value)}
                  className="form-select"
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => handleQuizChange('timeLimit', parseInt(e.target.value))}
                  className="form-input"
                  min="5"
                  max="180"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Questions</h2>
              <span className="section-badge">Step 2</span>
            </div>

            <div className="questions-section">
              {quiz.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {questionIndex + 1}</span>
                    <div className="question-actions">
                      {quiz.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="action-btn remove"
                          title="Remove Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Question Text</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      className="form-textarea"
                      placeholder="Enter your question here"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="options-section">
                    <label className="form-label required">Answer Options</label>
                    <div className="options-grid">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-row">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                            className="option-checkbox"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                            className="option-input"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="option-remove"
                              title="Remove Option"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {question.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="add-option-btn"
                        >
                          <Plus size={16} />
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explanation (Optional)</label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                      className="form-textarea"
                      placeholder="Explain the correct answer (shown after quiz completion)"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="add-question-section">
              <button
                type="button"
                onClick={addQuestion}
                className="add-question-btn"
              >
                <Plus size={20} />
                Add New Question
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Quiz...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
