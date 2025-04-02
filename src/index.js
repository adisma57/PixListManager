// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Retirez <React.StrictMode> en développement pour voir si l'erreur disparaît
root.render(<App />);
