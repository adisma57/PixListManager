// src/pages/SongSearch.jsx
import React, { useState } from 'react';
import { searchTracks } from '../services/spotifyService'; // Assurez-vous d'avoir implémenté cette fonction
import AddTracksToPlaylistModal from '../components/AddTracksToPlaylistModal'; // Composant similaire à AddAlbumToPlaylistModal
import './SongSearch.css';

const SongSearch = () => {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const results = await searchTracks(query);
      setTracks(results);
    } catch (error) {
      console.error("Erreur lors de la recherche des chansons :", error);
    }
  };

  const toggleSelectTrack = (track) => {
    if (selectedTracks.some(t => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter(t => t.id !== track.id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  return (
    <div className="song-search">
      <h1>Recherche chanson</h1>
      <form onSubmit={handleSearch} className="song-search-form">
        <input
          type="text"
          placeholder="Entrez le titre d'une chanson..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Rechercher</button>
      </form>
      {tracks.length > 0 && (
        <div className="song-search-results">
          <ul>
            {tracks.map(track => (
              <li key={track.id} onClick={() => toggleSelectTrack(track)} className={selectedTracks.some(t => t.id === track.id) ? "selected" : ""}>
                {track.name} - {track.artists.map(a => a.name).join(', ')}
              </li>
            ))}
          </ul>
          {selectedTracks.length > 0 && (
            <div className="add-tracks-action">
              <button onClick={() => setShowModal(true)}>
                Ajouter les chansons sélectionnées à une playlist
              </button>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <AddTracksToPlaylistModal
          selectedTracks={selectedTracks}
          onClose={() => {
            setShowModal(false);
            setSelectedTracks([]);
          }}
        />
      )}
    </div>
  );
};

export default SongSearch;
