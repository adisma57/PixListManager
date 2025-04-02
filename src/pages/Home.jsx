// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { isAuthenticated, setTokenFromUrl, login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extrait le token depuis l'URL après redirection OAuth
    setTokenFromUrl();
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      // Si l'utilisateur est connecté, rediriger vers /playlists
      navigate('/playlists');
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return (
      <div className="home-container">
        <section className="hero">
          <div className="hero-content">
            <h1>Bienvenue sur MySpotifyApp</h1>
            <p>Connectez-vous pour découvrir vos playlists et explorer votre univers musical.</p>
            <button onClick={login} className="login-btn">Login</button>
          </div>
        </section>
      </div>
    );
  } else {
    return null;
  }
};

export default Home;
