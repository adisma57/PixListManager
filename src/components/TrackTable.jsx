// src/components/TrackTable.jsx
import React from 'react';
import './TrackTable.css';

const TrackTable = ({ tracks }) => {
  return (
    <div className="track-table-container">
      <table className="track-table">
        <thead>
          <tr>
            <th>Track</th>
            <th>Year</th>
            <th>Acousticness</th>
            <th>Danceability</th>
            <th>Energy</th>
            <th>Instrumental</th>
            <th>Liveness</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr key={track.id || index}>
              <td className="track-name">{track.name}</td>
              <td>{track.year || 'N/A'}</td>
              <td>{renderBar(track.acousticness)}</td>
              <td>{renderBar(track.danceability)}</td>
              <td>{renderBar(track.energy)}</td>
              <td>{renderBar(track.instrumentalness)}</td>
              <td>{renderBar(track.liveness)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Affiche une barre colorée en fonction de la valeur (0 à 1)
function renderBar(value = 0) {
  const percentage = Math.round(value * 100);
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="progress-label">{percentage}%</span>
    </div>
  );
}

export default TrackTable;
