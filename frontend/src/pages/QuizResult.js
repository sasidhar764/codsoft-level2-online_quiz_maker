import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trophy, Clock, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { formatTime, getGradeColor } from '../utils/helpers';
import Confetti from 'react-confetti';
import './QuizResult.css';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz } = location.state || {};

  useEffect(() => {
    if (!result || !quiz) {
      navigate('/dashboard');
    }
  }, [result, quiz, navigate]);

  if (!result || !quiz) {
    return null;
  }

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You're a quiz master! 🎉";
    if (percentage >= 80) return "Excellent work! You really know your stuff! 👏";
    if (percentage >= 70) return "Great job! You're doing well! 👍";
    if (percentage >= 60) return "Good effort! Keep learning and improving! 📚";
    return "Don't give up! Practice makes perfect! 💪";
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="quiz-result-page">
      {result.percentage >= 80 && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="container">
        <div className="result-container">
          <div className="result-header">
            <div className="result-icon">
              <Trophy 
                size={64} 
                style={{ color: getPerformanceColor(result.percentage) }}
              />
            </div>
            <h1>Quiz Completed!</h1>
            <p className="quiz-title">{quiz.title}</p>
          </div>

          <div className="result-stats">
            <div className="stat-card main-score">
              <div className="score-circle">
                <div 
                  className="score-text"
                  style={{ color: getPerformanceColor(result.percentage) }}
                >
                  {result.percentage}%
                </div>
                <div className="score-label">Score</div>
              </div>
              <div 
                className="grade-badge"
                style={{ backgroundColor: getGradeColor(result.grade) }}
              >
                Grade: {result.grade}
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <CheckCircle className="stat-icon text-green-500" size={24} />
                <div className="stat-content">
                  <div className="stat-number">{result.correctAnswers}</div>
                  <div className="stat-label">Correct</div>
                </div>
              </div>

              <div className="stat-item">
                <XCircle className="stat-icon text-red-500" size={24} />
                <div className="stat-content">
                  <div className="stat-number">
                    {result.totalQuestions - result.correctAnswers}
                  </div>
                  <div className="stat-label">Incorrect</div>
                </div>
              </div>

              <div className="stat-item">
                <Clock className="stat-icon text-blue-500" size={24} />
                <div className="stat-content">
                  <div className="stat-number">{formatTime(result.timeSpent)}</div>
                  <div className="stat-label">Time Spent</div>
                </div>
              </div>

              <div className="stat-item">
                <Trophy className="stat-icon text-yellow-500" size={24} />
                <div className="stat-content">
                  <div className="stat-number">{result.earnedPoints || result.score}</div>
                  <div className="stat-label">Points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="performance-message">
            <p>{getPerformanceMessage(result.percentage)}</p>
            {result.isPassed ? (
              <div className="pass-badge">
                <CheckCircle size={20} />
                Passed
              </div>
            ) : (
              <div className="fail-badge">
                <XCircle size={20} />
                Failed
              </div>
            )}
          </div>

          <div className="result-actions">
            <Link to="/dashboard" className="btn btn-primary">
              <Home size={20} />
              Go to Dashboard
            </Link>
            
            <Link to="/browse" className="btn btn-secondary">
              <RotateCcw size={20} />
              Take Another Quiz
            </Link>
          </div>

          <div className="quiz-info">
            <h3>Quiz Details</h3>
            <div className="quiz-details">
              <div className="detail-item">
                <span className="label">Category:</span>
                <span className="value">{quiz.category}</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">{quiz.difficulty}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Questions:</span>
                <span className="value">{result.totalQuestions}</span>
              </div>
              <div className="detail-item">
                <span className="label">Completed At:</span>
                <span className="value">
                  {new Date(result.completedAt || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
