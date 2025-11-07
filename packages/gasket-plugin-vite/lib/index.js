import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Gasket Vite Plugin
 * 
 * Framework-agnostic integration of Vite with Gasket's Express server
 * Works with ANY frontend framework: React, Vue, Svelte, Preact, Solid, Lit, or vanilla JS
 * 
 * Purpose: Integrate Vite frontend with Gasket server features (API routes, auth, etc.)
 * If you don't need Gasket server features, just use Vite directly (vite dev/build/preview)!
 * 
 * Framework Support:
 * - React: Use @vitejs/plugin-react in vite.config.js
 * - Vue: Use @vitejs/plugin-vue in vite.config.js
 * - Svelte: Use @sveltejs/vite-plugin-svelte in vite.config.js
 * - Preact: Use @preact/preset-vite in vite.config.js
 * - Solid: Use vite-plugin-solid in vite.config.js
 * - Lit/Web Components: No plugin needed, works out of the box
 * - Vanilla JS: No plugin needed
 * 
 * Modes:
 * - Development: Vite dev server in middleware mode with SSR support
 * - Production: Serves built files (hybrid SSR/SPA based on enableSSR function)
 * 
 * Build Structure (following Vite best practices):
 * - dist/client/ - Client build output (static assets + index.html)
 * - dist/server/ - Server build output (entry-server.js)
 * 
 * Build Commands:
 * - "build:client": "vite build --outDir dist/client --ssrManifest"
 * - "build:server": "vite build --outDir dist/server --ssr src/entry-server.[js|jsx|ts|tsx|vue|svelte]"
 * 
 * Configuration (in gasket.js):
 * vite: {
 *   entryServer: 'src/entry-server.js',  // Optional: custom SSR entry path
 *   root: process.cwd(),                   // Optional: custom root directory
 *   configFile: 'vite.config.js'          // Optional: custom Vite config file
 * }
 */
/**
 * Helper: Find SSR entry file with various extensions (framework-agnostic)
 * Checks for .js, .jsx, .ts, .tsx, .vue, .svelte extensions
 */
function findSSREntry(root, customPath) {
  if (customPath) {
    const fullPath = path.join(root, customPath);
    return fs.existsSync(fullPath) ? customPath : null;
  }
  
  // Common SSR entry extensions for different frameworks
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
  const basePath = 'src/entry-server';
  
  for (const ext of extensions) {
    const entryPath = `${basePath}${ext}`;
    if (fs.existsSync(path.join(root, entryPath))) {
      return entryPath;
    }
  }
  
  return null;
}

export default {
  name: '@gasket/plugin-vite',
  
  hooks: {
    async express(gasket, app) {
      const isDev = process.env.NODE_ENV === 'development';
      
      // Get configuration from gasket.config (framework-agnostic)
      const viteConfig = gasket.config?.vite || {};
      const root = viteConfig.root || process.cwd();
      const configFile = viteConfig.configFile || path.join(root, 'vite.config.js');
      const customEntryServer = viteConfig.entryServer;
      
      const distPath = path.join(root, 'dist');
      
      if (isDev) {
        // ===== DEVELOPMENT MODE =====
        // Create Vite server in middleware mode (framework-agnostic)
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'custom', // Disables Vite's HTML serving logic
          root,
          configFile
        });
        
        // Use Vite's connect middleware for HMR and module transformation
        app.use(vite.middlewares);
        
        // Auto-detect SSR entry file (supports any framework)
        const ssrEntry = findSSREntry(root, customEntryServer);
        const hasSsr = ssrEntry !== null;
        
        if (hasSsr) {
          gasket.logger.info(`[@gasket/plugin-vite] Dev mode: Hybrid SSR/SPA (using ${ssrEntry})`);
          
          // SSR handler for development (framework-agnostic)
          app.use('*', async (req, res, next) => {
            const url = req.originalUrl;
            
            try {
              // 1. Read index.html template
              let template = await fs.promises.readFile(
                path.join(root, 'index.html'), 
                'utf-8'
              );
              
              // 2. Apply Vite HTML transforms (injects HMR client, applies plugin transforms)
              template = await vite.transformIndexHtml(url, template);
              
              // 3. Load the server entry with HMR support
              // ssrLoadModule automatically transforms ESM for Node.js - no bundling required!
              // Works with any framework: React, Vue, Svelte, Preact, Solid, etc.
              const ssrModule = await vite.ssrLoadModule(`/${ssrEntry}`);
              const { render, enableSSR } = ssrModule;
              
              // 4. Check if SSR is enabled for this route (hybrid approach)
              if (enableSSR && !enableSSR(url, { req, res })) {
                // SPA mode - send transformed template without SSR
                gasket.logger.debug(`[@gasket/plugin-vite] SPA mode: ${url}`);
                return res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
              }
              
              // 5. SSR mode - render on server using framework's SSR API
              // The render() function is implemented by YOU based on your framework
              gasket.logger.debug(`[@gasket/plugin-vite] SSR mode: ${url}`);
              const context = { req, res };
              const appHtml = await render(url, context);
              
              // 6. Inject the app-rendered HTML into the template
              let html = template.replace('<!--app-html-->', appHtml);
              
              // 7. Inject server data if provided (for hydration)
              if (context.serverData) {
                const dataScript = `<script>window.__SERVER_DATA__=${JSON.stringify(context.serverData)}</script>`;
                html = html.replace('</head>', `${dataScript}</head>`);
              }
              
              // 8. Send the rendered HTML
              res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
            } catch (e) {
              // Fix stack trace to map back to source code
              vite.ssrFixStacktrace(e);
              gasket.logger.error('[@gasket/plugin-vite] SSR error:', e);
              next(e);
            }
          });
        } else {
          gasket.logger.info('[@gasket/plugin-vite] Dev mode: SPA only ---------------------s');
          
          // SPA fallback handler for development
          app.use('*', async (req, res) => {
            try {
              // Read and transform index.html for SPA
              let template = await fs.promises.readFile(
                path.join(root, 'index.html'), 
                'utf-8'
              );
              template = await vite.transformIndexHtml(req.originalUrl, template);
              res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
            } catch (e) {
              vite.ssrFixStacktrace(e);
              gasket.logger.error('[@gasket/plugin-vite] Error serving HTML:', e);
              res.status(500).end(e.message);
            }
          });
        }
        
        // Expose Vite instance for potential use in other plugins
        gasket.vite = vite;
        
      } else {
        // ===== PRODUCTION MODE =====
        // Framework-agnostic production serving
        // Following Vite's recommended structure: dist/client and dist/server
        const clientPath = path.join(distPath, 'client');
        const serverPath = path.join(distPath, 'server');
        
        // Support both new structure (dist/client) and legacy (dist/)
        const hasClientDist = fs.existsSync(clientPath);
        const actualClientPath = hasClientDist ? clientPath : distPath;
        const templatePath = path.join(actualClientPath, 'index.html');
        
        if (!fs.existsSync(actualClientPath)) {
          gasket.logger.warn('[@gasket/plugin-vite] Build output not found. Run build scripts first.');
          gasket.logger.warn('  Expected: npm run build:client && npm run build:server');
          return;
        }
        
        // Serve static assets from client build (contains CSS, JS, images, etc.)
        app.use(express.static(actualClientPath));
        
        // Check if SSR entry exists (built output is always .js, regardless of source framework)
        const ssrEntryPath = hasClientDist 
          ? path.join(serverPath, 'entry-server.js')
          : path.join(distPath, 'entry-server.js');
        
        if (fs.existsSync(ssrEntryPath)) {
          // ===== HYBRID SSR/SPA MODE =====
          // Framework-agnostic: Works with React, Vue, Svelte, Preact, Solid, Lit, etc.
          gasket.logger.info('[@gasket/plugin-vite] Production mode: Hybrid SSR/SPA');
          
          // Read the HTML template once (contains correct asset links from build)
          const template = await fs.promises.readFile(templatePath, 'utf-8');
          
          // Import the SSR module (result of SSR build)
          // Using dynamic import() instead of ssrLoadModule in production
          // Works with any framework - the render() function uses YOUR framework's SSR API
          const ssrModule = await import(ssrEntryPath);
          const { render, enableSSR } = ssrModule;
          
          app.use('*', async (req, res, next) => {
            try {
              const url = req.originalUrl;
              
              // Check if SSR is enabled for this specific route (hybrid control)
              if (enableSSR && !enableSSR(url, { req, res })) {
                // SSR disabled for this route - serve as SPA
                gasket.logger.debug(`[@gasket/plugin-vite] SPA mode: ${url}`);
                return res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
              }
              
              // SSR enabled for this route - render on server
              gasket.logger.debug(`[@gasket/plugin-vite] SSR mode: ${url}`);
              
              // Render the app HTML using YOUR framework's SSR API
              // React: ReactDOMServer.renderToString()
              // Vue: renderToString()
              // Svelte: App.render()
              // Preact: renderToString()
              // Solid: renderToString()
              // Lit: render() with collectResult()
              const context = { req, res };
              const appHtml = await render(url, context);
              
              // Inject the rendered HTML into the template
              let html = template.replace('<!--app-html-->', appHtml);
              
              // Inject server data if provided (for hydration)
              if (context.serverData) {
                const dataScript = `<script>window.__SERVER_DATA__=${JSON.stringify(context.serverData)}</script>`;
                html = html.replace('</head>', `${dataScript}</head>`);
              }
              
              res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
            } catch (error) {
              gasket.logger.error('[@gasket/plugin-vite] SSR error:', error);
              next(error);
            }
          });
        } else {
          // ===== PURE SPA MODE =====
          gasket.logger.info('[@gasket/plugin-vite] Production mode: SPA only');
          
          // Read template once for efficiency
          const template = await fs.promises.readFile(templatePath, 'utf-8');
          
          app.use('*', (req, res) => {
            res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
          });
        }
      }
    }
  }
};

