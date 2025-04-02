// src/services/spotifyService.js

import axios from 'axios';
import { getToken } from './authService';

/**
 * Création d'une instance axios préconfigurée pour l'API Spotify
 * avec injection du Bearer token via un interceptor.
 */
const axiosInstance = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------
   FONCTIONS DE RECHERCHE
   (recherche d'artistes, albums, titres)
   ------------------------------------------------------------------ */

/**
 * Recherche d'artistes par nom (limite 20 par défaut).
 * @param {string} query - Texte à chercher
 * @returns {Array} - Tableau d'objets artistes
 */
export const searchArtists = async (query) => {
  const response = await axiosInstance.get('/search', {
    params: {
      q: query,
      type: 'artist',
      limit: 50,
    },
  });
  return response.data.artists.items; // tableau d'artistes
};

/**
 * Recherche d'albums par nom (limite 20 par défaut).
 * @param {string} query - Texte à chercher
 * @returns {Array} - Tableau d'objets albums
 */
export const searchAlbums = async (query) => {
  const response = await axiosInstance.get('/search', {
    params: {
      q: query,
      type: 'album',
      limit: 50,
    },
  });
  return response.data.albums.items; // tableau d'albums
};

/**
 * Recherche de titres (tracks) par nom (limite 20 par défaut).
 * @param {string} query - Texte à chercher
 * @returns {Array} - Tableau d'objets tracks
 */
export const searchTracks = async (query) => {
  const response = await axiosInstance.get('/search', {
    params: {
      q: query,
      type: 'track',
      limit: 50,
    },
  });
  return response.data.tracks.items; // tableau de pistes
};

/* ------------------------------------------------------------------
   FONCTIONS POUR ARTISTES
   (infos de base, liste d'albums, etc.)
   ------------------------------------------------------------------ */

/**
 * Récupère les infos d'un artiste (nom, images, genres, popularité, etc.)
 * @param {string} artistId - ID de l'artiste Spotify
 * @returns {Object} - Objet artiste complet
 */
export const getArtistInfo = async (artistId) => {
  const response = await axiosInstance.get(`/artists/${artistId}`);
  return response.data; // ex: { id, name, images, genres, popularity, followers, ... }
};

/**
 * Récupère la liste des albums d'un artiste (albums, singles, compilations).
 * @param {string} artistId - ID de l'artiste
 * @param {boolean} includeLive - Indique s'il faut filtrer les albums contenant 'live' dans le titre
 * @returns {Array} - Tableau d'albums
 */
export const getArtistAlbums = async (artistId, includeLive = true) => {
  const response = await axiosInstance.get(`/artists/${artistId}/albums`, {
    params: {
      include_groups: 'album,single,compilation', // ajoutez 'appears_on' si besoin
      market: 'FR', // ou 'US', etc.
      limit: 50,
    },
  });
  let albums = response.data.items;
  if (!includeLive) {
    albums = albums.filter((album) => !/live/i.test(album.name));
  }
  return albums;
};

/* ------------------------------------------------------------------
   FONCTIONS POUR ALBUMS
   (infos sur un album, liste de ses pistes)
   ------------------------------------------------------------------ */

/**
 * Récupère les détails complets d'un album (images, label, tracks, etc.).
 * @param {string} albumId - ID de l'album Spotify
 * @returns {Object} - Objet album (incluant album.tracks.items)
 */
export const getAlbumDetails = async (albumId) => {
  const response = await axiosInstance.get(`/albums/${albumId}`);
  return response.data; // ex: { id, name, label, images, tracks: { items: [...] }, ... }
};

/**
 * Récupère la liste des pistes d'un album.
 * Si getAlbumDetails renvoie déjà album.tracks.items, cette fonction peut être optionnelle.
 * @param {string} albumId - ID de l'album Spotify
 * @returns {Array} - Tableau de pistes
 */
export const getAlbumTracks = async (albumId) => {
  const response = await axiosInstance.get(`/albums/${albumId}`);
  return response.data.tracks.items; // ex: [{ id, name, duration_ms, ... }, ...]
};

/* ------------------------------------------------------------------
   FONCTIONS POUR PLAYLISTS
   (création, ajout de pistes, suppression, etc.)
   ------------------------------------------------------------------ */

/**
 * Récupère les playlists de l'utilisateur connecté
 * @returns {Array} - Liste de playlists
 */
export const getUserPlaylists = async () => {
  const response = await axiosInstance.get('/me/playlists', {
    params: { limit: 50 }, // ajustez selon vos besoins
  });
  return response.data.items; // tableau de playlists
};

/**
 * Récupère l'utilisateur courant (afin de connaître son ID).
 * @returns {Object} - Objet utilisateur { id, display_name, ... }
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/me');
  return response.data;
};

/**
 * Crée une playlist pour l'utilisateur donné
 * @param {string} userId - ID de l'utilisateur
 * @param {string} playlistName - Nom de la playlist
 * @returns {Object} - Objet playlist créé (incluant son id)
 */
export const createPlaylist = async (userId, playlistName) => {
  const response = await axiosInstance.post(`/users/${userId}/playlists`, {
    name: playlistName,
    public: false, // ou true, selon vos besoins
  });
  return response.data; // ex: { id, name, ... }
};

/**
 * Ajoute des pistes (URIs) à la playlist spécifiée
 * @param {string} playlistId - ID de la playlist
 * @param {Array<string>} trackUris - Tableau de URIs de pistes
 * @returns {Object} - Réponse de l'API Spotify
 */
export const addTracksToPlaylist = async (playlistId, trackUris) => {
  // Spotify limite à 100 pistes par requête
  const responses = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    const chunk = trackUris.slice(i, i + 100);
    const response = await axiosInstance.post(`/playlists/${playlistId}/tracks`, {
      uris: chunk,
    });
    responses.push(response.data);
  }
  return responses;
};

/**
 * Retire une piste d'une playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} trackUri - URI de la piste à retirer
 * @returns {Object} - Réponse de l'API
 */
export const removeTrackFromPlaylist = async (playlistId, trackUri) => {
  const response = await axiosInstance.request({
    method: 'delete',
    url: `/playlists/${playlistId}/tracks`,
    data: {
      tracks: [{ uri: trackUri }],
    },
  });
  return response.data;
};

/**
 * Réordonne les pistes d'une playlist
 * @param {string} playlistId - ID de la playlist
 * @param {number} rangeStart - Index de la piste à déplacer
 * @param {number} insertBefore - Index de destination
 * @returns {Object} - Réponse de l'API
 */
export const reorderPlaylistTracks = async (playlistId, rangeStart, insertBefore) => {
  const response = await axiosInstance.put(`/playlists/${playlistId}/tracks`, {
    range_start: rangeStart,
    insert_before: insertBefore,
  });
  return response.data;
};


export const getPlaylistDetails = async (playlistId) => {
  const response = await axiosInstance.get(`/playlists/${playlistId}`);
  return response.data;
};

export const deletePlaylist = async (playlistId) => {
  // Spotify supprime la playlist côté utilisateur en faisant un "unfollow"
  // => DELETE /playlists/{playlist_id}/followers
  const response = await axiosInstance.delete(`/playlists/${playlistId}/followers`);
  return response.data;
};

/**
 * Récupère un lot de pistes pour une playlist donnée (100 max par requête).
 * @param {string} playlistId - ID de la playlist
 * @param {number} offset - index de départ
 * @param {number} limit - nb de pistes (max 100)
 * @returns {object} - un objet { items: [...], next: 'URL', total: number, ... }
 */
export const getPlaylistTracks = async (playlistId, offset = 0, limit = 100) => {
  const response = await axiosInstance.get(`/playlists/${playlistId}/tracks`, {
    params: { offset, limit },
  });
  // Spotify renvoie un objet { items, next, total, ... }
  return response.data; 
};

/**
 * Récupère les infos "de base" de la playlist (nom, description, images),
 * sans charger toutes les pistes.
 */
export const getPlaylistInfo = async (playlistId) => {
  const response = await axiosInstance.get(`/playlists/${playlistId}`, {
    params: { fields: 'name,description,images' },
  });
  return response.data; 
};

/**
 * Récupère *toutes* les pistes d'une playlist en paginant offset/limit=100
 * et les concatène dans un tableau unique.
 * @param {string} playlistId
 * @returns {Array} - Tableau de tous les items (objets { track, ... })
 */
export const getAllPlaylistTracks = async (playlistId) => {
  let offset = 0;
  const limit = 100;
  let allItems = [];
  let finished = false;

  while (!finished) {
    const response = await axiosInstance.get(`/playlists/${playlistId}/tracks`, {
      params: { offset, limit },
    });
    const data = response.data; // { items, next, total, ... }
    allItems = [...allItems, ...data.items];
    offset += data.items.length;
    if (!data.next || data.items.length < limit) {
      finished = true;
    }
  }
  return allItems; // un grand tableau
};

/**
 * Met à jour l'ordre des pistes d'une playlist.
 * Cette fonction supprime toutes les pistes de la playlist,
 * puis les réajoute dans l'ordre donné par trackUris.
 * Attention : cette méthode vide temporairement la playlist.
 *
 * @param {string} playlistId - L'ID de la playlist à réordonner
 * @param {Array<string>} trackUris - Tableau d'URIs dans le nouvel ordre souhaité
 * @returns {Promise<any>}
 */
export const setPlaylistOrder = async (playlistId, trackUris) => {
  // Supprime toutes les pistes de la playlist
  await axiosInstance.request({
    method: 'delete',
    url: `/playlists/${playlistId}/tracks`,
    data: {
      tracks: trackUris.map(uri => ({ uri })),
    },
  });

  // Réajoute les pistes dans le nouvel ordre
  // La fonction addTracksToPlaylist doit gérer le découpage en lots de 100 si nécessaire
  await addTracksToPlaylist(playlistId, trackUris);
};