// src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, login, logout } from '../services/authService';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Vérifier si on est connecté
  const authenticated = isAuthenticated();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // redirige vers la page d'accueil
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>
          <h1>MySpotifyApp</h1>
        </div>
      </div>

      {/* La barre de recherche est masquée si pas connecté */}
      {authenticated && (
        <div className="header-center">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Rechercher</button>
          </form>
        </div>
      )}

      <div className="header-right">
        {authenticated ? (
          <button onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button onClick={login}>
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
