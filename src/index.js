import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/Authentication/AuthContext';
import './index.css';


const rootElement = document.getElementById('root');

const app = (
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}