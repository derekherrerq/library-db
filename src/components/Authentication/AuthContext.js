// src/components/Authentication/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    role: null,
    userID: null, // Add userID to authState
  });

  const login = (token, role, userID) => { // Add userID parameter
    setAuthState({
      isAuthenticated: true,
      token: token,
      role: role,
      userID: userID, // Set userID in state
    });
    // Optionally, store token, role, and userID in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userID', userID);
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      role: null,
      userID: null, // Reset userID
    });
    // Remove token, role, and userID from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userID');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};