import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistAlbums } from '../services/spotifyService';
import AddAlbumToPlaylistModal from '../components/AddAlbumToPlaylistModal';
import './ArtistPage.css';

const ArtistPage = () => {
  const { id } = useParams();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [includeLive, setIncludeLive] = useState(true);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getArtistAlbums(id, includeLive);
        setAlbums(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des albums:", error);
      }
    };
    fetchAlbums();
  }, [id, includeLive]);

  const toggleSelectAlbum = (album) => {
    if (selectedAlbums.some(a => a.id === album.id)) {
      setSelectedAlbums(selectedAlbums.filter(a => a.id !== album.id));
    } else {
      setSelectedAlbums([...selectedAlbums, album]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAlbums.length === albums.length) {
      setSelectedAlbums([]);
    } else {
      setSelectedAlbums(albums);
    }
  };

  return (
    <div className="artist-page">
      <h1>Albums</h1>
      <div className="artist-controls">
        <label>
          <input
            type="checkbox"
            checked={includeLive}
            onChange={() => setIncludeLive(!includeLive)}
          />
          Inclure les albums live
        </label>
        <button onClick={toggleSelectAll}>
          {selectedAlbums.length === albums.length ? 'Désélectionner tous' : 'Sélectionner tous'}
        </button>
      </div>
      <div className="albums-grid">
        {albums.map(album => (
          <div key={album.id} className="album-card">
            <img
              src={album.images[0]?.url}
              alt={album.name}
              className="album-image"
              onClick={() => setSelectedAlbum(album)}
            />
            <div className="album-info">
              <span className="album-name">{album.name}</span>
              <span className="album-year">{album.release_date.substring(0, 4)}</span>
            </div>
            <input
              type="checkbox"
              checked={selectedAlbums.some(a => a.id === album.id)}
              onChange={() => toggleSelectAlbum(album)}
              className="album-checkbox"
            />
          </div>
        ))}
      </div>
      {selectedAlbums.length > 0 && (
        <div className="add-albums-action">
          <button onClick={() => setShowModal(true)}>
            Ajouter les albums sélectionnés à une playlist
          </button>
        </div>
      )}
      {selectedAlbum && (
        <div className="album-details-modal">
          <h2>{selectedAlbum.name}</h2>
          <button onClick={() => setSelectedAlbum(null)}>Fermer</button>
        </div>
      )}
      {showModal && (
        <AddAlbumToPlaylistModal
          selectedAlbums={selectedAlbums}
          onClose={() => {
            setShowModal(false);
            setSelectedAlbums([]);
          }}
        />
      )}
    </div>
  );
};

export default ArtistPage;
