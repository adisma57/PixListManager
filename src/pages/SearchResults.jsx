// src/pages/SearchResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  searchArtists,
  searchAlbums,
  searchTracks,
} from '../services/spotifyService';
import './SearchResults.css';

const TABS = {
  ARTIST: 'artist',
  ALBUM: 'album',
  TRACK: 'track',
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Onglet actif : "artist" (par défaut), "album", ou "track"
  const [activeTab, setActiveTab] = useState(TABS.ARTIST);

  // Les tableaux complets renvoyés par l'API
  const [artistAll, setArtistAll] = useState([]);
  const [albumAll, setAlbumAll] = useState([]);
  const [trackAll, setTrackAll] = useState([]);

  // Nombre d'éléments actuellement affichés (pagination locale)
  const [artistDisplayCount, setArtistDisplayCount] = useState(20);
  const [albumDisplayCount, setAlbumDisplayCount] = useState(20);
  const [trackDisplayCount, setTrackDisplayCount] = useState(20);

  // Chargement initial
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Référence pour le conteneur scrollable
  const containerRef = useRef(null);

  // Permet de naviguer vers /artist/:id ou /album/:id
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!query) return;
      setLoadingInitial(true);
      try {
        // Les fonctions searchArtists, searchAlbums, searchTracks renvoient des tableaux
        const [artists, albums, tracks] = await Promise.all([
          searchArtists(query),
          searchAlbums(query),
          searchTracks(query),
        ]);

        // Stockage complet
        setArtistAll(artists || []);
        setAlbumAll(albums || []);
        setTrackAll(tracks || []);

        // Réinitialise la pagination
        setArtistDisplayCount(20);
        setAlbumDisplayCount(20);
        setTrackDisplayCount(20);
      } catch (err) {
        console.error('Erreur lors de la recherche :', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadData();
  }, [query]);

  // handleScroll : si on est proche du bas, on augmente la pagination du tab actif
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // ~100px avant la fin
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (activeTab === TABS.ARTIST && artistDisplayCount < artistAll.length) {
        setArtistDisplayCount(prev => prev + 20);
      } else if (activeTab === TABS.ALBUM && albumDisplayCount < albumAll.length) {
        setAlbumDisplayCount(prev => prev + 20);
      } else if (activeTab === TABS.TRACK && trackDisplayCount < trackAll.length) {
        setTrackDisplayCount(prev => prev + 20);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeTab, artistDisplayCount, albumDisplayCount, trackDisplayCount]);

  // Rendu pour Artistes
  const renderArtists = () => {
    const visible = artistAll.slice(0, artistDisplayCount);
    return (
      <ul className="results-list">
        {visible.map((artist) => (
          <li
            key={artist.id}
            className="results-item"
            onClick={() => navigate(`/artist/${artist.id}`)}
          >
            <span className="result-title">{artist.name}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Rendu pour Albums
  const renderAlbums = () => {
    const visible = albumAll.slice(0, albumDisplayCount);
    return (
      <ul className="results-list">
        {visible.map((album) => (
          <li
            key={album.id}
            className="results-item"
            onClick={() => navigate(`/album/${album.id}`)}
          >
            <img
              src={album.images[0]?.url}
              alt={album.name}
              className="result-thumbnail"
            />
            <span className="result-title">{album.name}</span>
            <span className="result-subtitle">{album.release_date}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Rendu pour Titres
  const renderTracks = () => {
    const visible = trackAll.slice(0, trackDisplayCount);
    return (
      <ul className="results-list">
        {visible.map((track) => (
          <li key={track.id} className="results-item">
            <span className="result-title">{track.name}</span>
            <span className="result-subtitle">
              {track.artists.map(a => a.name).join(', ')}
            </span>
            {/* Si vous souhaitez rediriger vers /album/:id => navigate(`/album/${track.album.id}`) */}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="search-results-container">
      <h2>Résultats pour "{query}"</h2>
      {loadingInitial && <p>Chargement initial...</p>}

      {/* Onglets */}
      <div className="tabs-menu">
        <button
          className={activeTab === TABS.ARTIST ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab(TABS.ARTIST)}
        >
          Artistes
        </button>
        <button
          className={activeTab === TABS.ALBUM ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab(TABS.ALBUM)}
        >
          Albums
        </button>
        <button
          className={activeTab === TABS.TRACK ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab(TABS.TRACK)}
        >
          Titres
        </button>
      </div>

      {/* Container scrollable */}
      <div className="results-scrollable" ref={containerRef}>
        {activeTab === TABS.ARTIST && renderArtists()}
        {activeTab === TABS.ALBUM && renderAlbums()}
        {activeTab === TABS.TRACK && renderTracks()}

        {/* Affiche un message quand on a déjà affiché tout */}
        {activeTab === TABS.ARTIST && artistDisplayCount >= artistAll.length && (
          <p style={{ textAlign: 'center', color: '#777', marginTop: '10px' }}>
            Plus de résultats
          </p>
        )}
        {activeTab === TABS.ALBUM && albumDisplayCount >= albumAll.length && (
          <p style={{ textAlign: 'center', color: '#777', marginTop: '10px' }}>
            Plus de résultats
          </p>
        )}
        {activeTab === TABS.TRACK && trackDisplayCount >= trackAll.length && (
          <p style={{ textAlign: 'center', color: '#777', marginTop: '10px' }}>
            Plus de résultats
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
