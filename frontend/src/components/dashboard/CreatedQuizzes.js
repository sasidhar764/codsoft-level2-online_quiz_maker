import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Users, Star } from 'lucide-react';
import { formatDate, getDifficultyColor } from '../../utils/helpers';
import { useDeleteQuiz } from '../../hooks/useQuiz';
import './CreatedQuizzes.css';

const CreatedQuizzes = ({ quizzes }) => {
  const deleteQuizMutation = useDeleteQuiz();

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)) {
      try {
        await deleteQuizMutation.mutateAsync(quizId);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    }
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="created-quizzes">
        <div className="created-quizzes-header">
          <h3 className="created-quizzes-title">Your Created Quizzes</h3>
          <Link to="/create-quiz" className="created-quizzes-action">
            <Plus size={16} />
            Create Quiz
          </Link>
        </div>
        
        <div className="created-quizzes-empty">
          <Plus size={48} />
          <h3>No quizzes created yet</h3>
          <p>You haven't created any quizzes yet. Start by creating your first quiz!</p>
          <Link to="/create-quiz" className="btn">
            <Plus size={16} />
            Create Your First Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="created-quizzes">
      <div className="created-quizzes-header">
        <h3 className="created-quizzes-title">Your Created Quizzes</h3>
        <Link to="/create-quiz" className="created-quizzes-action">
          <Plus size={16} />
          Create Quiz
        </Link>
      </div>
      
      <div className="created-quizzes-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="created-quiz-card">
            <div className="quiz-card-header">
              <div className="quiz-meta-badges">
                <span className="quiz-category-badge">{quiz.category}</span>
                <span className={`quiz-difficulty-badge quiz-difficulty-${quiz.difficulty.toLowerCase()}`}>
                  {quiz.difficulty}
                </span>
              </div>
              
              <div className="quiz-status-badges">
                <span className={`status-badge ${quiz.isPublic ? 'public' : 'private'}`}>
                  {quiz.isPublic ? 'Public' : 'Private'}
                </span>
                <span className={`status-badge ${quiz.isActive ? 'active' : 'inactive'}`}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="quiz-card-content">
              <h4 className="quiz-title">{quiz.title}</h4>
              <p className="quiz-created-date">Created on {formatDate(quiz.createdAt)}</p>
              
              <div className="quiz-stats-grid">
                <div className="quiz-stat">
                  <Users size={16} />
                  <span>{quiz.totalAttempts} attempts</span>
                </div>
                <div className="quiz-stat">
                  <Star size={16} />
                  <span>{quiz.averageScore}% avg score</span>
                </div>
              </div>
            </div>
            
            <div className="quiz-card-actions">
              <Link 
                to={`/quiz/${quiz.id}`}
                className="action-btn view"
                title="View Quiz"
              >
                <Eye size={16} />
              </Link>
              <Link 
                to={`/edit-quiz/${quiz.id}`}
                className="action-btn edit"
                title="Edit Quiz"
              >
                <Edit size={16} />
              </Link>
              <button 
                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                className="action-btn delete"
                title="Delete Quiz"
                disabled={deleteQuizMutation.isLoading}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatedQuizzes;
