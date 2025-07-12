import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { quizService } from '../services/quiz';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import './TakeQuiz.css';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: quiz, isLoading, error } = useQuery(
    ['quiz', id],
    () => quizService.getQuiz(id),
    {
      onSuccess: (data) => {
        setTimeLeft(data.quiz.timeLimit * 60);
        setStartTime(Date.now());
        setAnswers(new Array(data.quiz.questions.length).fill(null));
      }
    }
  );

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft, quiz, isSubmitting]);

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      selectedOption: optionIndex,
      timeSpent: Math.floor((Date.now() - startTime) / 1000)
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Check if all questions are answered
    const unansweredQuestions = answers.filter(answer => answer === null).length;
    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }
    
    setIsSubmitting(true);
    try {
      const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      const response = await quizService.submitQuiz(id, answers, totalTimeSpent);
      
      toast.success('Quiz submitted successfully!');
      navigate('/result', { 
        state: { 
          result: response.result, 
          quiz: quiz.quiz 
        } 
      });
    } catch (error) {
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length;
  };

  const getProgress = () => {
    return Math.round(((currentQuestion + 1) / quiz.quiz.questions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="quiz-taking-page">
        <div className="quiz-taking-container">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-taking-page">
        <div className="quiz-taking-container">
          <div className="quiz-error">
            <AlertCircle size={64} className="error-icon" />
            <h2 className="error-title">Failed to Load Quiz</h2>
            <p className="error-message">
              We couldn't load the quiz. Please check your connection and try again.
            </p>
            <button 
              onClick={() => navigate('/browse')}
              className="nav-button primary"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.quiz.questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  return (
    <div className="quiz-taking-page">
      <div className="quiz-taking-container">
        {/* Quiz Header */}
        <div className="quiz-header">
          <div className="quiz-info">
            <div className="quiz-title-section">
              <h1 className="quiz-title">{quiz.quiz.title}</h1>
              <div className="quiz-meta">
                <div className="quiz-meta-item">
                  <CheckCircle size={16} />
                  <span>Question {currentQuestion + 1} of {quiz.quiz.questions.length}</span>
                </div>
                <div className="quiz-meta-item">
                  <span>{quiz.quiz.category}</span>
                </div>
                <div className="quiz-meta-item">
                  <span>{quiz.quiz.difficulty}</span>
                </div>
              </div>
            </div>
            
            <div className={`timer-section ${timeLeft < 300 ? 'timer-warning' : ''}`}>
              <Clock size={20} className="timer-icon" />
              <div className="timer-display">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">
                Progress: {getAnsweredCount()} of {quiz.quiz.questions.length} answered
              </span>
              <span className="progress-percentage">{getProgress()}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Container */}
        <div className="question-container">
          <div className="question-number-badge">
            {currentQuestion + 1}/{quiz.quiz.questions.length}
          </div>
          
          <h2 className="question-text">{question.question}</h2>
          
          <div className="options-container">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option ${answers[currentQuestion]?.selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="option-letter">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="option-text">{option.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button 
            onClick={handlePrevious} 
            disabled={isFirstQuestion}
            className="nav-button"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <div className="question-indicators">
            {quiz.quiz.questions.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentQuestion ? 'active' : ''
                } ${answers[index] !== null ? 'answered' : ''}`}
                onClick={() => goToQuestion(index)}
                title={`Question ${index + 1}${answers[index] !== null ? ' (Answered)' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {isLastQuestion ? (
            <button 
              onClick={handleSubmit} 
              className="nav-button submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white' }}></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="nav-button primary"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
