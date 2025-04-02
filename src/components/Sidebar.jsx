// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">Accueil</NavLink>
        <NavLink to="/playlists" className="sidebar-link">Playlists</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
