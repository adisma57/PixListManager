// src/pages/PlaylistDetails.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPlaylistInfo,
  getAllPlaylistTracks,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  deletePlaylist,
  setPlaylistOrder,
} from '../services/spotifyService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaTimes } from 'react-icons/fa';
import './PlaylistDetails.css';

// Fonction de mélange (Fisher–Yates)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [allTracks, setAllTracks] = useState([]); // Toutes les pistes de la playlist
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(false);

  const [totalDurationMs, setTotalDurationMs] = useState(0);

  // Pour le scroll infini (affichage local)
  const [displayCount, setDisplayCount] = useState(20);
  const containerRef = useRef(null);

  // Chargement des infos de la playlist (nom, description, images)
  useEffect(() => {
    const loadInfo = async () => {
      setLoadingInfo(true);
      try {
        const info = await getPlaylistInfo(id);
        setPlaylistInfo(info);
      } catch (err) {
        console.error("Erreur getPlaylistInfo :", err);
      } finally {
        setLoadingInfo(false);
      }
    };
    loadInfo();
  }, [id]);

  // Chargement de toutes les pistes de la playlist via pagination
  useEffect(() => {
    const loadTracks = async () => {
      setLoadingTracks(true);
      try {
        const tracksData = await getAllPlaylistTracks(id);
        setAllTracks(tracksData);
        let total = 0;
        tracksData.forEach(item => {
          if (item.track?.duration_ms) {
            total += item.track.duration_ms;
          }
        });
        setTotalDurationMs(total);
      } catch (err) {
        console.error("Erreur getAllPlaylistTracks :", err);
      } finally {
        setLoadingTracks(false);
      }
    };
    loadTracks();
  }, [id]);

  // Gestion du scroll infini (affichage local)
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (displayCount < allTracks.length) {
        setDisplayCount(prev => prev + 20);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [allTracks, displayCount]);

  // Suppression de la playlist
  const handleDeletePlaylist = async () => {
    if (loadingDelete) return;
    setLoadingDelete(true);
    try {
      await deletePlaylist(id);
      navigate('/');
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Impossible de supprimer la playlist.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Suppression d'une piste
  const handleRemoveTrack = async (trackUri) => {
    try {
      await removeTrackFromPlaylist(id, trackUri);
      setAllTracks(prev => prev.filter(item => item.track.uri !== trackUri));
    } catch (error) {
      console.error("Erreur lors de la suppression de la piste :", error);
      alert("Impossible de retirer la piste.");
    }
  };

  // Drag & drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;
    const newOrder = Array.from(allTracks);
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destIndex, 0, movedItem);
    setAllTracks(newOrder);
    try {
      await reorderPlaylistTracks(id, sourceIndex, destIndex);
    } catch (error) {
      console.error("Erreur lors du réordonnancement :", error);
      alert("Impossible de réordonner les pistes.");
    }
  };

  // Fonction pour randomiser la playlist
  const handleRandomize = async () => {
    if (loadingRandom) return;
    setLoadingRandom(true);
    try {
      const shuffled = shuffleArray(allTracks);
      setAllTracks(shuffled);
      const newOrderUris = shuffled.map(item => item.track.uri);
      await setPlaylistOrder(id, newOrderUris);
    } catch (error) {
      console.error("Erreur lors de la randomisation :", error);
      alert("Impossible de randomiser la playlist.");
    } finally {
      setLoadingRandom(false);
    }
  };

  // Formatage de la durée totale (affichage en heures si nécessaire)
  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const rest = ms % 3600000;
    const minutes = Math.floor(rest / 60000);
    const seconds = Math.floor((rest % 60000) / 1000);
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const totalFormatted = formatDuration(totalDurationMs);
  const displayTracks = allTracks.slice(0, displayCount);

  if (loadingInfo && !playlistInfo) {
    return <div className="playlist-details loading-state">Chargement infos...</div>;
  }
  if (!playlistInfo) {
    return <div className="playlist-details error-state">Playlist non trouvée.</div>;
  }

  return (
    <div className="playlist-details">
      <header className="playlist-details-header">
        <div className="playlist-info-left">
          {playlistInfo.images?.length > 0 ? (
            <img
              src={playlistInfo.images[0].url}
              alt={playlistInfo.name}
              className="playlist-cover"
            />
          ) : (
            <img
              src="/default-playlist.png"
              alt={playlistInfo.name}
              className="playlist-cover"
            />
          )}
        </div>
        <div className="playlist-info-right">
          <h2>{playlistInfo.name}</h2>
          {playlistInfo.description && (
            <p className="playlist-description">{playlistInfo.description}</p>
          )}
          <p className="playlist-duration">
            {allTracks.length} pistes – {totalFormatted}
          </p>
          <div className="playlist-actions">
            <button
              className="randomize-playlist-btn"
              onClick={handleRandomize}
              disabled={loadingRandom}
            >
              {loadingRandom ? "Randomisation..." : "Randomiser la playlist"}
            </button>
            <button
              className="delete-playlist-btn"
              onClick={handleDeletePlaylist}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Suppression..." : "Supprimer la playlist"}
            </button>
          </div>
        </div>
      </header>

      <div className="tracks-container" ref={containerRef}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tracks-droppable">
            {(provided) => (
              <ul className="tracks-list" ref={provided.innerRef} {...provided.droppableProps}>
                {displayTracks.map((item, index) => {
                  const track = item.track;
                  const artists = track.artists?.map(a => a.name).join(', ');
                  const albumName = track.album?.name;
                  return (
                    <Draggable
                      key={track.id || track.uri}
                      draggableId={track.id || track.uri}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`track-item ${snapshot.isDragging ? "dragging" : ""}`}
                        >
                          {/* Seule l’icône active le drag */}
                          <div className="drag-handle" {...provided.dragHandleProps}>
                            <FaGripVertical size={20} color="#ccc" />
                          </div>
                          <div className="track-content">
                            <div className="track-main-line">
                              <span className="track-number">{index + 1}.</span>
                              <span className="track-name">{track.name}</span>
                            </div>
                            <div className="track-subinfo">
                              <span
                                className="track-artists"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/artist/${track.artists[0]?.id}`);
                                }}
                              >
                                {artists}
                              </span>
                              {albumName && (
                                <>
                                  <span> – </span>
                                  <span
                                    className="track-album"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/album/${track.album?.id}`);
                                    }}
                                  >
                                    {albumName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="track-right">
                            <span className="track-duration">
                              {formatDuration(track.duration_ms)}
                            </span>
                            <button
                              className="remove-track-btn"
                              onClick={() => handleRemoveTrack(track.uri)}
                            >
                              <FaTimes size={16} color="#ff4b4b" />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        {displayCount < allTracks.length && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '8px' }}>
            Scrollez pour afficher plus...
          </p>
        )}
        {loadingTracks && allTracks.length > 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>Chargement...</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;
