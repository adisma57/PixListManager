// src/components/AlbumDisplay.jsx
import React, { useState, useEffect } from 'react';
import { getAlbumTracks } from '../services/spotifyService';
import AddAlbumToPlaylistModal from './AddAlbumToPlaylistModal';

const AlbumDisplay = ({ album, onBack }) => {
  const [tracks, setTracks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchTracks() {
      const data = await getAlbumTracks(album.id);
      setTracks(data);
    }
    fetchTracks();
  }, [album.id]);

  return (
    <div>
      <button onClick={onBack}>Retour</button>
      <h2>{album.name} ({album.release_date.substring(0,4)})</h2>
      <img src={album.images[0]?.url} alt={album.name} style={{ width: '200px', borderRadius: '8px' }} />
      <h3>Chansons :</h3>
      <ul>
        {tracks.map(track => (
          <li key={track.id}>{track.track_number}. {track.name}</li>
        ))}
      </ul>
      <button onClick={() => setShowModal(true)}>
        Ajouter cet album à une playlist
      </button>
      {showModal && (
        <AddAlbumToPlaylistModal 
          selectedAlbums={[album]} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default AlbumDisplay;
