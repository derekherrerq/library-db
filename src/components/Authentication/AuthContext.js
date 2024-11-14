// src/components/Authentication/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    role: null,
  });

  const login = (token, role) => {
    setAuthState({
      isAuthenticated: true,
      token: token,
      role: role,
    });
    // Optionally, store token and role in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      role: null,
    });
    // Remove token and role from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};