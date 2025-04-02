// src/components/AddAlbumToPlaylistModal.jsx
import React, { useState, useEffect } from 'react';
import {
  getUserPlaylists,
  createPlaylist,
  addTracksToPlaylist,
  getCurrentUser,
  getAlbumTracks,
} from '../services/spotifyService';
import './AddAlbumToPlaylistModal.css';

const AddAlbumToPlaylistModal = ({ selectedAlbums, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error("Erreur lors de la récupération des playlists :", error);
      }
    };
    fetchPlaylists();
  }, []);

  const handleAddAlbums = async () => {
    if (!selectedAlbums || selectedAlbums.length === 0) {
      alert("Aucun album à ajouter.");
      return;
    }
    setLoading(true);
    try {
      let playlistId = selectedPlaylist;

      // Créer une nouvelle playlist si on a saisi un nom
      if (newPlaylistName) {
        const user = await getCurrentUser();
        const newPl = await createPlaylist(user.id, newPlaylistName);
        playlistId = newPl.id;
      }

      // Pour chaque album sélectionné, on récupère les pistes
      let allUris = [];
      for (const album of selectedAlbums) {
		  console.log(album)
        const tracks = await getAlbumTracks(album.id);
        const uris = tracks.map(t => t.uri);
        allUris.push(...uris);
      }

      if (playlistId && allUris.length > 0) {
        await addTracksToPlaylist(playlistId, allUris);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout des albums :", error);
      alert("Impossible d'ajouter les albums à la playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajouter {selectedAlbums?.length} album(s) à une playlist</h2>
        <p>Chaque album sera entièrement ajouté (tous les titres).</p>

        <div className="select-playlist-section">
          <label>Choisir une playlist :</label>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
          >
            <option value="">-- Sélectionnez --</option>
            {playlists.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>

        <div className="new-playlist-section">
          <label>Ou créer une nouvelle playlist :</label>
          <input
            type="text"
            placeholder="Nom de la nouvelle playlist"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleAddAlbums} disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter"}
          </button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default AddAlbumToPlaylistModal;
