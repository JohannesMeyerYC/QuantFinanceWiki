import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');

const rootElement = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, rootElement);
} else {
  createRoot(container).render(rootElement);
}