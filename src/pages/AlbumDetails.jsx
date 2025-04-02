// src/pages/AlbumDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAlbumDetails,
  getAlbumTracks
} from '../services/spotifyService';
import AddAlbumToPlaylistModal from '../components/AddAlbumToPlaylistModal';
import './AlbumDetails.css';

const AlbumDetails = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const albumData = await getAlbumDetails(id);
        setAlbum(albumData);
        if (albumData.tracks?.items) {
          setTracks(albumData.tracks.items);
        } else {
          const trackData = await getAlbumTracks(id);
          setTracks(trackData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'album :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return <div className="album-details loading-state">Chargement...</div>;
  }
  if (!album) {
    return <div className="album-details error-state">Album non trouvé.</div>;
  }

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration_ms, 0);

  return (
    <div className="album-details">
      <header className="album-header">
        <div className="album-cover">
          <img
            src={album.images?.[0]?.url || '/default-album.png'}
            alt={album.name}
          />
        </div>
        <div className="album-info">
          <h1 className="album-name">{album.name}</h1>
          {album.artists && (
            <p className="album-artist">
              {album.artists.map(a => a.name).join(', ')}
            </p>
          )}
          <p className="album-meta">
            {tracks.length} chansons – Durée totale : {formatDuration(totalDuration)}
          </p>
          {album.label && <p className="album-label">Label : {album.label}</p>}
          {album.description && (
            <p className="album-description">{album.description}</p>
          )}
          <button
            className="add-album-btn"
            onClick={() => setShowModal(true)}
          >
            Ajouter cet album à une playlist
          </button>
        </div>
      </header>

      <section className="album-tracks">
        <h2 className="tracks-title"></h2>
        <ul className="tracks-list">
          {tracks.map((track, i) => (
            <li key={track.id} className="track-item">
              <span className="track-index">{i + 1}.</span>
              <span className="track-name">{track.name}</span>
              <span className="track-duration">
                {formatDuration(track.duration_ms)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showModal && (
        <AddAlbumToPlaylistModal
          selectedAlbums={[album]}
          tracks={tracks}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AlbumDetails;
