import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Calendar, BookOpen } from 'lucide-react';
import { formatDateTime, getGradeColor } from '../../utils/helpers';
import './RecentTests.css';

const RecentTests = ({ tests }) => {
  if (!tests || tests.length === 0) {
    return (
      <div className="recent-tests">
        <div className="recent-tests-header">
          <h3 className="recent-tests-title">Recent Test Results</h3>
        </div>
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No test results yet</h3>
          <p>Take a quiz to see your results here!</p>
          <Link to="/browse" className="btn btn-primary">
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-tests">
      <div className="recent-tests-header">
        <h3 className="recent-tests-title">Recent Test Results</h3>
      </div>
      
      <div className="test-results-list">
        {tests.map((result) => (
          <div key={result.id} className="test-result-item">
            <div className="test-header">
              <div className="test-info">
                <h4 className="test-title">{result.quizTitle}</h4>
                <div className="test-meta">
                  <span className="test-category">{result.category}</span>
                  <span className={`test-difficulty ${result.difficulty?.toLowerCase()}`}>
                    {result.difficulty}
                  </span>
                </div>
              </div>
              <div className="test-score" style={{ color: getGradeColor(result.grade) }}>
                <Award size={16} />
                <span>{result.percentage}%</span>
              </div>
            </div>
            
            <div className="test-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${result.percentage}%`,
                    backgroundColor: getGradeColor(result.grade)
                  }}
                />
              </div>
              <span className="progress-text">
                {result.score}/{result.totalPoints} points
              </span>
            </div>
            
            <div className="test-stats">
              <div className="stat">
                <Clock size={14} />
                <span>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
              </div>
              <div className="stat">
                <Calendar size={14} />
                <span>{formatDateTime(result.completedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTests;
