import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleExploreCatalog = () => {
    navigate('/user-dashboard'); // Redirect to user dashboard
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to the Library</h1>
          <p>Your gateway to explore our vast collection of resources.</p>
          <button className="cta-button" onClick={handleExploreCatalog}>
            Explore Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
