// src/components/PlaylistManager.jsx
import React, { useState, useEffect } from 'react';
import { getUserPlaylists, getCurrentUser, createPlaylist, deletePlaylist } from '../services/spotifyService';
import { useNavigate } from 'react-router-dom';

const PlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const navigate = useNavigate();

  const fetchPlaylists = async () => {
    const data = await getUserPlaylists();
    setPlaylists(data);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    if (newPlaylistName) {
      const user = await getCurrentUser();
      const newPlaylist = await createPlaylist(user.id, newPlaylistName);
      // Mise à jour en ajoutant la nouvelle playlist à la liste
      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistName('');
    }
  };

  const handleDelete = async (playlistId) => {
    await deletePlaylist(playlistId);
    setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
  };

  const handleViewDetails = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <div>
      <h2>Mes Playlists</h2>
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nom de la nouvelle playlist" 
          value={newPlaylistName} 
          onChange={(e) => setNewPlaylistName(e.target.value)}
        />
        <button onClick={handleCreate}>Créer</button>
      </div>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #ccc' }}>
            <span>{playlist.name}</span>
            <div>
              <button onClick={() => handleViewDetails(playlist.id)}>Détails</button>
              <button onClick={() => handleDelete(playlist.id)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistManager;
