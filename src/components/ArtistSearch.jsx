import React, { useState } from 'react';

const ArtistSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleKeyPress = (e) => {
    if(e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Rechercher un artiste..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
      />
    </div>
  );
};

export default ArtistSearch;
