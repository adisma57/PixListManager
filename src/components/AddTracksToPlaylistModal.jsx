// src/components/AddTracksToPlaylistModal.jsx
import React from 'react';
import './AddTracksToPlaylistModal.css';

const AddTracksToPlaylistModal = ({ selectedTracks, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajouter des chansons à une playlist</h2>
        <p>{selectedTracks.length} chanson(s) sélectionnée(s)</p>
        {/* Ici, ajoutez la logique pour choisir ou créer une playlist */}
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default AddTracksToPlaylistModal;
