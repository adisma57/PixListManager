// src/pages/PlaylistPage.jsx
import React, { useState, useEffect } from 'react';
import { getUserPlaylists } from '../services/spotifyService';
import { useNavigate } from 'react-router-dom';
import './PlaylistPage.css';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [sortCriteria, setSortCriteria] = useState(''); // Par défaut, aucun tri
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des playlists :", error);
      }
    };
    fetchPlaylists();
  }, []);

  // Gère le tri (par nom ou nbChansons). Le clic sur la même colonne inverse la direction.
  const handleSort = (criteria) => {
    if (sortCriteria === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('asc');
    }
  };

  // Filtre les playlists par nom en fonction de la barre de recherche
  const filteredPlaylists = playlists.filter(pl =>
    pl.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si aucun sortCriteria, on affiche le tableau tel quel
  const displayedPlaylists = sortCriteria
    ? [...filteredPlaylists].sort((a, b) => {
        let valueA, valueB;
        switch (sortCriteria) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'nbChansons':
            valueA = a.tracks.total;
            valueB = b.tracks.total;
            break;
          default:
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
        }
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredPlaylists;

  // Clic sur une ligne pour aller à la page de détail de la playlist
  const handleRowClick = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <div className="playlist-page">
      <h1>Mes Playlists</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher une playlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="playlist-table">
        <thead>
          <tr>
            <th>Image</th>
            <th onClick={() => handleSort('name')}>
              Nom {sortCriteria === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('nbChansons')}>
              Nombre de chansons {sortCriteria === 'nbChansons' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedPlaylists.map(pl => (
            <tr key={pl.id} onClick={() => handleRowClick(pl.id)}>
              <td>
                <img
                  src={pl.images[0]?.url || '/default-playlist.png'}
                  alt={pl.name}
                  className="playlist-thumbnail"
                />
              </td>
              <td>{pl.name}</td>
              <td>{pl.tracks.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaylistPage;
