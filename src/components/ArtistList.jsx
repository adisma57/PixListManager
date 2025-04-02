import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtistList = ({ artists }) => {
  const navigate = useNavigate();

  return (
    <div>
      {artists.map(artist => (
        <div 
          key={artist.id} 
          style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
          onClick={() => navigate(`/artist/${artist.id}`)}
        >
          {artist.name}
        </div>
      ))}
    </div>
  );
};

export default ArtistList;
