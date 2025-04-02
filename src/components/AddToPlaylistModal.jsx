// src/components/AddToPlaylistModal.jsx
import React, { useState, useEffect } from 'react';
import {
  getUserPlaylists,
  addTracksToPlaylist,
  createPlaylist,
  // Si vous souhaitez ajouter des albums par l'API Spotify :
  // addAlbumToPlaylist, ...
} from '../services/spotifyService';
import './AddToPlaylistModal.css';

const AddToPlaylistModal = ({ items, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

  const handleSubmit = async () => {
    try {
      let playlistId = selectedPlaylist;

      // Si on souhaite créer une nouvelle playlist
      if (newPlaylistName) {
        const user = await getUserPlaylists(); // ou getCurrentUser() pour avoir l'ID user
        // En réalité, on doit faire: createPlaylist(user.id, newPlaylistName)
        // Supposez que createPlaylist retourne l'id de la nouvelle playlist
        const newPl = await createPlaylist(user.id, newPlaylistName);
        playlistId = newPl.id;
      }

      // Préparer la liste des tracks (URIs) si on a des titres ou des albums, etc.
      let uris = [];
      for (const item of items) {
        if (item.type === 'track') {
          uris.push(item.data.uri);
        } else if (item.type === 'album') {
          // Récupérer tous les titres de l'album, ex: let tracks = await getAlbumTracks(item.data.id);
          // uris.push(...tracks.map(t => t.uri));
        } else if (item.type === 'artist') {
          // Logique selon vos besoins (ajouter tous les albums/titres de l'artiste ?)
        }
      }

      if (uris.length > 0) {
        await addTracksToPlaylist(playlistId, uris);
      }

      onClose();
    } catch (err) {
      console.error("Erreur lors de l'ajout :", err);
      alert("Impossible d'ajouter les éléments à la playlist.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajouter {items.length} élément(s) à une playlist</h2>

        <div className="select-playlist-section">
          <label>Playlist existante :</label>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
          >
            <option value="">Sélectionnez une playlist</option>
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>

        <div className="new-playlist-section">
          <label>Ou créer une nouvelle playlist :</label>
          <input
            type="text"
            placeholder="Nom de la playlist"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit}>Ajouter</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
