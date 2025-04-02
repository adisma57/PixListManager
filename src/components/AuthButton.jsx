import React, { useState, useEffect } from 'react';
import { login, logout, isAuthenticated } from '../services/authService';

const AuthButton = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  const handleAuth = () => {
    if (auth) {
      logout();
      setAuth(false);
    } else {
      login();
    }
  };

  return (
    <button onClick={handleAuth}>
      {auth ? 'Logout' : 'Login'}
    </button>
  );
};

export default AuthButton;
