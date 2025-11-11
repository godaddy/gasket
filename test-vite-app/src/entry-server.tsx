import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';

/**
 * Server-side rendering entry point
 * 
 * This file is automatically detected by @gasket/plugin-vite
 * When present, the plugin enables SSR mode
 */

/**
 * Render function called by Vite plugin during SSR
 * @param url - The request URL
 * @param context - Request context (req, res)
 */
export async function render(url: string, context: any) {
  const { req } = context;
  
  // Pass server-side data to the app
  const serverData = {
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  
  // Store serverData in context so the plugin can inject it separately
  context.serverData = serverData;
  
  // Render React app to HTML string (ONLY the app HTML, no headers/footers)
  // Headers/footers are injected by the middleware at the body level
  const html = ReactDOMServer.renderToString(<App serverData={serverData} />);
  
  return html;
}

/**
 * Optional: Control SSR per-route
 * Return false to fallback to SPA mode for specific routes
 */
export function enableSSR(url: string, context: any) {
  // Enable SSR for all routes
  // You could add logic here like:
  // return url.startsWith('/marketing');
  return true;
}

