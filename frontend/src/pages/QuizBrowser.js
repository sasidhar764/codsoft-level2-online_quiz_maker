import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Grid, List, Clock, Users, Star, BookOpen, Trophy } from 'lucide-react';
import { quizService } from '../services/quiz';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { QUIZ_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';
import { debounce } from '../utils/helpers';
import './QuizBrowser.css';

const QuizBrowser = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['quizzes', filters, page],
    () => quizService.getQuizzes({ ...filters, page, limit: 12 }),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000
    }
  );

  const debouncedSearch = debounce((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const QuizCard = ({ quiz }) => (
    <div className="quiz-browser-card">
      <div className="quiz-browser-card-header">
        <div className="quiz-browser-category-badge">
          {quiz.category}
        </div>
        <div 
          className="quiz-browser-difficulty-badge"
          style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
        >
          {quiz.difficulty}
        </div>
      </div>
      
      <div className="quiz-browser-card-content">
        <h3 className="quiz-browser-card-title">{quiz.title}</h3>
        <p className="quiz-browser-card-description">{quiz.description}</p>
        
        <div className="quiz-browser-card-stats">
          <div className="quiz-browser-stat">
            <BookOpen size={16} />
            <span>{quiz.totalQuestions || quiz.questions?.length || 0} Questions</span>
          </div>
          <div className="quiz-browser-stat">
            <Clock size={16} />
            <span>{quiz.timeLimit} min</span>
          </div>
          <div className="quiz-browser-stat">
            <Users size={16} />
            <span>{quiz.totalAttempts} attempts</span>
          </div>
          <div className="quiz-browser-stat">
            <Star size={16} />
            <span>{quiz.averageScore}% avg</span>
          </div>
        </div>
        
        <div className="quiz-browser-card-creator">
          <span>Created by {quiz.creator?.username || 'Anonymous'}</span>
        </div>
      </div>
      
      <div className="quiz-browser-card-footer">
        <a 
          href={`/quiz/${quiz.id}`} 
          className="quiz-browser-take-btn"
        >
          <Trophy size={18} />
          Take Quiz
        </a>
      </div>
    </div>
  );

  if (isLoading && !data) {
    return (
      <div className="quiz-browser-loading">
        <LoadingSpinner text="Loading quizzes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-browser-error">
        <div className="container">
          <div className="quiz-browser-error-message">
            <h2>Failed to load quizzes</h2>
            <p>Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const quizzes = data?.quizzes || [];
  const pagination = data?.pagination || {};

  return (
    <div className="quiz-browser">
      <div className="container">
        <div className="quiz-browser-header">
          <h1>Browse Quizzes</h1>
          <p>Discover and take quizzes on various topics</p>
        </div>

        {/* Filters */}
        <div className="quiz-browser-filters">
          <div className="quiz-browser-search">
            <Search size={20} className="quiz-browser-search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              onChange={handleSearchChange}
              className="quiz-browser-search-input"
            />
          </div>

          <div className="quiz-browser-filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="quiz-browser-filter-select"
            >
              <option value="">All Categories</option>
              {QUIZ_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="quiz-browser-filter-select"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="quiz-browser-filter-select"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="totalAttempts-desc">Most Popular</option>
              <option value="averageScore-desc">Highest Rated</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
            </select>
          </div>

          <div className="quiz-browser-view-controls">
            <button
              onClick={() => setViewMode('grid')}
              className={`quiz-browser-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`quiz-browser-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="quiz-browser-results">
          <div className="quiz-browser-results-header">
            <p>
              {pagination.totalQuizzes > 0 
                ? `Showing ${((pagination.currentPage - 1) * 12) + 1}-${Math.min(pagination.currentPage * 12, pagination.totalQuizzes)} of ${pagination.totalQuizzes} quizzes`
                : 'No quizzes found'
              }
            </p>
          </div>

          {quizzes.length > 0 ? (
            <>
              <div className={`quiz-browser-grid ${viewMode}`}>
                {quizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="quiz-browser-pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="quiz-browser-pagination-btn"
                  >
                    Previous
                  </button>
                  
                  <div className="quiz-browser-pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="quiz-browser-pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="quiz-browser-empty">
              <Filter size={48} />
              <h3>No quizzes found</h3>
              <p>Try adjusting your search criteria or browse all quizzes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizBrowser;
