import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy';
      case 'Medium': return 'difficulty-medium';
      case 'Hard': return 'difficulty-hard';
      default: return 'difficulty-medium';
    }
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <div className="quiz-category">{quiz.category}</div>
        <div className={`quiz-difficulty ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </div>
      </div>
      
      <div className="quiz-card-content">
        <h3 className="quiz-title">{quiz.title}</h3>
        <p className="quiz-description">{quiz.description}</p>
        
        <div className="quiz-stats">
          <div className="stat">
            <BookOpen size={16} />
            <span>{quiz.totalQuestions} Questions</span>
          </div>
          <div className="stat">
            <Clock size={16} />
            <span>{quiz.timeLimit} min</span>
          </div>
          <div className="stat">
            <Users size={16} />
            <span>{quiz.totalAttempts} attempts</span>
          </div>
          <div className="stat">
            <Star size={16} />
            <span>{quiz.averageScore}% avg</span>
          </div>
        </div>
        
        <div className="quiz-creator">
          Created by {quiz.creator?.username || 'Anonymous'}
        </div>
      </div>
      
      <div className="quiz-card-footer">
        <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">
          Take Quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizCard;
