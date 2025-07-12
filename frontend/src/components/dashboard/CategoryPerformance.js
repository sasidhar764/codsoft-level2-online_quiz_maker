import React from 'react';
import { TrendingUp, Target, BarChart } from 'lucide-react';
import './CategoryPerformance.css';

const CategoryPerformance = ({ performance }) => {
  if (!performance || performance.length === 0) {
    return (
      <div className="category-performance">
        <div className="category-performance-header">
          <h3 className="category-performance-title">Category Performance</h3>
        </div>
        <div className="category-empty">
          <BarChart size={48} />
          <h3>No performance data</h3>
          <p>Take quizzes in different categories to see your performance breakdown.</p>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="category-performance">
      <div className="category-performance-header">
        <h3 className="category-performance-title">Category Performance</h3>
      </div>
      
      <div className="category-list">
        {performance.map((category) => (
          <div key={category.category} className="category-item">
            <div className="category-header">
              <h4 className="category-name">{category.category}</h4>
              <span className="category-badge">{category.totalAttempts}</span>
            </div>
            
            <div className="category-metrics">
              <div className="metric">
                <span className="metric-value" style={{ color: getPerformanceColor(category.averageScore) }}>
                  {category.averageScore}%
                </span>
                <span className="metric-label">Average</span>
              </div>
              
              <div className="metric">
                <span className="metric-value" style={{ color: getPerformanceColor(category.bestScore) }}>
                  {category.bestScore}%
                </span>
                <span className="metric-label">Best</span>
              </div>
            </div>
            
            <div className="category-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${category.averageScore}%`,
                    backgroundColor: getPerformanceColor(category.averageScore)
                  }}
                />
              </div>
              <span className="progress-label">{category.averageScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPerformance;
