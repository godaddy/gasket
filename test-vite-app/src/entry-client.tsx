import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Client-side entry point for SSR hydration
 * 
 * When SSR is enabled, this file hydrates the server-rendered HTML
 * instead of doing a full client-side render
 */

// Get server data injected during SSR
const serverData = (window as any).__SERVER_DATA__ || null;

// Hydrate instead of render to preserve server-rendered HTML
ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App serverData={serverData} />
  </React.StrictMode>
);

