import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Brain, 
  Trophy, 
  Zap, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import welcomeImage from '../assets/welcome.jpg';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register');

  const openAuthModal = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const features = [
    {
      icon: Brain,
      title: "Smart Quiz Creation",
      description: "Create engaging quizzes with multiple question types and detailed explanations."
    },
    {
      icon: Trophy,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and performance insights."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate results and explanations to accelerate your learning."
    }
  ];

  return (
    <>
      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Master Your Knowledge with
                  <span className="text-primary"> QuizMaster</span>
                </h1>
                
                <p className="hero-description">
                  Create, share, and take interactive quizzes that make learning engaging and effective. 
                  Track your progress and unlock your full potential.
                </p>
                
                <div className="hero-actions">
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" className="btn btn-primary btn-large">
                        Go to Dashboard
                        <ArrowRight size={16} />
                      </Link>
                      <Link to="/browse" className="btn btn-secondary btn-large">
                        Browse Quizzes
                      </Link>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => openAuthModal('register')}
                        className="btn btn-primary btn-large"
                      >
                        Get Started Free
                        <ArrowRight size={16} />
                      </button>
                      <Link to="/browse" className="btn btn-secondary btn-large">
                        Explore Quizzes
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="hero-image">
                <img 
                  src={welcomeImage} 
                  alt="Welcome to QuizMaster - Interactive Learning Platform" 
                  className="main-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <h2 className="section-title">Why Choose QuizMaster?</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <feature.icon size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Home;
