import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // Perform login logic here
    setIsAuthenticated(true);
    navigate('/login'); // Redirects to the login page
  };

  const handleLogoutClick = () => {
    // Perform logout logic here
    setIsAuthenticated(false);
    navigate('/'); // Redirects to the landing page
  };

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to The Cougar Library</h1>
        <p className="hero-description">
          Discover, borrow, and manage resources effortlessly. Your digital gateway to an expansive world of books, magazines, devices, and media.
        </p>
        {isAuthenticated ? (
          <button className="landing-button" onClick={handleLogoutClick}>
            Logout
          </button>
        ) : (
          <button className="landing-button" onClick={handleLoginClick}>
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPage;