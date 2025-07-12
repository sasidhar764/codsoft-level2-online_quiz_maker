import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus, 
  BarChart3, 
  BookOpen,
  Home,
  Search
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const openAuthModal = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo" onClick={closeMenu}>
              <div className="logo-icon">🧠</div>
              <span className="logo-text">QuizMaster</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <div className="nav-links">
                <Link to="/" className="nav-link" onClick={closeMenu}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                
                <Link to="/browse" className="nav-link" onClick={closeMenu}>
                  <Search size={18} />
                  <span>Browse Quizzes</span>
                </Link>
                
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                      <BarChart3 size={18} />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link to="/create-quiz" className="nav-link nav-link-primary" onClick={closeMenu}>
                      <Plus size={18} />
                      <span>Create Quiz</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Auth Section */}
              <div className="nav-auth">
                {isAuthenticated ? (
                  <div className="user-menu">
                    <button 
                      className="user-button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className="user-avatar">
                        {user?.profile?.firstName ? 
                          user.profile.firstName.charAt(0).toUpperCase() : 
                          user?.username?.charAt(0).toUpperCase() || 'U'
                        }
                      </div>
                      <span className="user-name">
                        {user?.profile?.firstName || user?.username || 'User'}
                      </span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="user-dropdown">
                        <div className="user-info">
                          <div className="user-details">
                            <p className="user-full-name">
                              {user?.profile?.firstName && user?.profile?.lastName 
                                ? `${user.profile.firstName} ${user.profile.lastName}`
                                : user?.username
                              }
                            </p>
                            <p className="user-email">{user?.email}</p>
                          </div>
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <Link to="/dashboard" className="dropdown-item" onClick={closeMenu}>
                          <BarChart3 size={16} />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link to="/create-quiz" className="dropdown-item" onClick={closeMenu}>
                          <Plus size={16} />
                          <span>Create Quiz</span>
                        </Link>
                        
                        <div className="dropdown-divider"></div>
                        
                        <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <button 
                      onClick={() => openAuthModal('login')}
                      className="btn btn-ghost"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => openAuthModal('register')}
                      className="btn btn-primary"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Header;
