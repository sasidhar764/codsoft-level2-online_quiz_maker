import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { quizService } from '../../services/quiz';
import LoadingSpinner from '../common/LoadingSpinner';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizTaking = () => {
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
        // Initialize answers array with proper structure
        setAnswers(new Array(data.quiz.questions.length).fill(null).map(() => ({
          selectedOption: null,
          timeSpent: 0
        })));
      }
    }
  );

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmit();
    }
  }, [timeLeft, quiz]);

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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Ensure all answers have proper structure
      const processedAnswers = answers.map((answer, index) => ({
        selectedOption: answer?.selectedOption ?? 0,
        timeSpent: answer?.timeSpent ?? 0
      }));
      
      const response = await quizService.submitQuiz(id, processedAnswers, totalTimeSpent);
      
      navigate('/result', { 
        state: { 
          result: response.result, 
          quiz: quiz.quiz 
        } 
      });
    } catch (error) {
      console.error('Submit quiz error:', error);
      toast.error('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <LoadingSpinner text="Loading quiz..." />;
  if (error) return <div className="error">Failed to load quiz</div>;

  const question = quiz.quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.quiz.questions.length) * 100;

  return (
    <div className="quiz-taking">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{quiz.quiz.title}</h2>
          <div className="quiz-meta">
            <span>Question {currentQuestion + 1} of {quiz.quiz.questions.length}</span>
            <div className="timer">
              <Clock size={18} />
              <span className={timeLeft < 300 ? 'timer-warning' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="question-container">
        <h3 className="question-text">{question.question}</h3>
        
        <div className="options-container">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option ${answers[currentQuestion]?.selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        
        <div className="question-indicators">
          {quiz.quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentQuestion ? 'active' : ''} ${answers[index]?.selectedOption !== null ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        {currentQuestion === quiz.quiz.questions.length - 1 ? (
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="btn btn-primary"
          >
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTaking;
