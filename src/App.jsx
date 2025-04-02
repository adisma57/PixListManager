// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PlaylistPage from './pages/PlaylistPage';
import PlaylistDetails from './pages/PlaylistDetails';
import AlbumDetails from './pages/AlbumDetails';
import SongSearch from './pages/SongSearch';
import SearchResults from './pages/SearchResults'; // page de résultats de recherche globale
import ArtistDetail from './pages/ArtistDetail';

import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<PlaylistPage />} />
            <Route path="/playlists/:id" element={<PlaylistDetails />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/song-search" element={<SongSearch />} />
            <Route path="/search" element={<SearchResults />} />
			<Route path="/artist/:id" element={<ArtistDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
