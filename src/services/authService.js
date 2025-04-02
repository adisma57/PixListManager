// src/services/authService.js
const CLIENT_ID = '2e6b08b351044408b418683cb45af6dd';
const REDIRECT_URI = 'http://pix-list-manager.vercel.app/';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

export function login() {
  const scope = [
    "user-read-private",
    "user-read-email",
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
    "user-library-modify",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-follow-read",
    "user-follow-modify",
    "streaming",
    "app-remote-control"
  ].join(" ");
  
  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(scope)}`;
  window.location = authUrl;
}

export function logout() {
  localStorage.removeItem('spotify_token');
  window.location.reload();
}

export function isAuthenticated() {
  return localStorage.getItem('spotify_token') !== null;
}

export function setTokenFromUrl() {
  const hash = window.location.hash;
  if (hash) {
    const token = hash
      .substring(1)
      .split('&')
      .find(elem => elem.startsWith('access_token'))
      ?.split('=')[1];
    if (token) {
      localStorage.setItem('spotify_token', token);
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }
}

export function getToken() {
  return localStorage.getItem('spotify_token');
}
