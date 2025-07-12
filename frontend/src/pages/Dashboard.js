import React from 'react';
import { useQuery } from 'react-query';
import { quizService } from '../services/quiz';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTests from '../components/dashboard/RecentTests';
import CategoryPerformance from '../components/dashboard/CategoryPerformance';
import CreatedQuizzes from '../components/dashboard/CreatedQuizzes';
import './Dashboard.css';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    quizService.getDashboard
  );

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="error">Failed to load dashboard</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your Dashboard</h1>
          <p className="dashboard-subtitle">Track your progress and manage your quizzes</p>
        </div>

        <DashboardStats stats={dashboardData.dashboard.overview} />
        
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <RecentTests tests={dashboardData.dashboard.recentTests} />
          </div>
          
          <div className="dashboard-sidebar">
            <CategoryPerformance 
              performance={dashboardData.dashboard.categoryPerformance} 
            />
          </div>
        </div>

        <div className="dashboard-section">
          <CreatedQuizzes quizzes={dashboardData.dashboard.createdQuizzes} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
