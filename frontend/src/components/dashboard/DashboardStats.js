import React from 'react';
import { BarChart3, Trophy, BookOpen, Users } from 'lucide-react';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      icon: BookOpen,
      label: 'Tests Taken',
      value: stats.totalTestsTaken,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Trophy,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: BarChart3,
      label: 'Quizzes Created',
      value: stats.totalQuizzesCreated,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      label: 'Quiz Attempts',
      value: stats.totalQuizAttempts,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="dashboard-stats">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon ${item.bgColor}`}>
            <item.icon className={item.color} size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
