// src/pages/ArtistDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistInfo, getArtistAlbums } from '../services/spotifyService';
import AddAlbumToPlaylistModal from '../components/AddAlbumToPlaylistModal';
import './ArtistDetail.css';

const ArtistDetail = () => {
  const { id } = useParams(); // ID de l'artiste
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Albums sélectionnés via checkbox
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Toggle pour afficher/cacher les albums live
  const [includeLive, setIncludeLive] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      try {
        const artistData = await getArtistInfo(id);
        setArtist(artistData);
        const allAlbums = await getArtistAlbums(id);
        setAlbums(allAlbums);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'artiste :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistData();
  }, [id]);

  // Filtrage local pour masquer les albums live si nécessaire
  const filteredAlbums = includeLive
    ? albums
    : albums.filter(album => !/live/i.test(album.name));

  const toggleSelectAlbum = (album) => {
    const found = selectedAlbums.find(a => a.id === album.id);
    if (found) {
      setSelectedAlbums(selectedAlbums.filter(a => a.id !== album.id));
    } else {
      setSelectedAlbums([...selectedAlbums, album]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAlbums.length === filteredAlbums.length) {
      setSelectedAlbums([]);
    } else {
      setSelectedAlbums(filteredAlbums);
    }
  };

  const handleAddSelectedToPlaylist = () => {
    if (selectedAlbums.length === 0) {
      alert("Aucun album sélectionné.");
      return;
    }
    setShowModal(true);
  };

  if (loading) {
    return <div className="artist-detail loading-state">Chargement...</div>;
  }
  if (!artist) {
    return <div className="artist-detail error-state">Artiste non trouvé.</div>;
  }

  const displayedGenres = artist.genres?.slice(0, 3).join(', ');

  return (
    <div className="artist-detail">
      <header className="artist-header">
        <div className="artist-photo">
          {artist.images && artist.images.length > 0 ? (
            <img src={artist.images[0].url} alt={artist.name} />
          ) : (
            <img src="/default-artist.png" alt={artist.name} />
          )}
        </div>
        <div className="artist-info">
          <h1 className="artist-name">{artist.name}</h1>
          {displayedGenres && (
            <p className="artist-genres">Genres : {displayedGenres}</p>
          )}
          {artist.popularity !== undefined && (
            <p className="artist-popularity">Popularité : {artist.popularity}</p>
          )}
        </div>
      </header>

      <section className="artist-albums">
        <h2 className="albums-title">Albums</h2>
        <div className="artist-controls">
          <label>
            <input
              type="checkbox"
              checked={includeLive}
              onChange={() => setIncludeLive(!includeLive)}
            />
            Inclure les albums live
          </label>
          {filteredAlbums.length > 0 && (
            <button onClick={toggleSelectAll}>
              {selectedAlbums.length === filteredAlbums.length ? 'Désélectionner tous' : 'Sélectionner tous'}
            </button>
          )}
        </div>
        {filteredAlbums.length === 0 ? (
          <p className="no-albums">Aucun album trouvé.</p>
        ) : (
          <>
            {selectedAlbums.length > 0 && (
              <div className="add-selected-action">
                <button onClick={handleAddSelectedToPlaylist}>
                  Ajouter les {selectedAlbums.length} album(s) sélectionné(s) à une playlist
                </button>
              </div>
            )}
            <ul className="albums-list">
              {filteredAlbums.map(album => {
                const isSelected = selectedAlbums.some(a => a.id === album.id);
                return (
                  <li key={album.id} className="album-item">
                    {/* La carte album est cliquable et redirige vers la page de l'album */}
                    <div className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
                      <img
                        src={album.images[0]?.url || '/default-album.png'}
                        alt={album.name}
                        className="album-cover"
                      />
                      <div className="album-meta">
                        <span className="album-name">{album.name}</span>
                        <span className="album-year">{album.release_date?.substring(0, 4)}</span>
                      </div>
                    </div>
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectAlbum(album)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

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

export default ArtistDetail;
