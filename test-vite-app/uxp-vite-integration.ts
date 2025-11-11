/**
 * UXP Integration Plugin for Vite
 * 
 * This plugin integrates Presentation Central with Vite by:
 * 1. Fetching PC data before rendering (UXP plugin handles v2/v3 normalization)
 * 2. Intercepting HTML responses
 * 3. Injecting headers/footers and assets at the appropriate locations
 * 
 * Supports both PC API v2 and v3 transparently (UXP plugin normalizes for us).
 * 
 * Note: We use string manipulation because Vite's plugin only controls
 * what goes inside <div id="root">. To inject at body level, we need
 * to intercept the final HTML response.
 */

export default {
  name: 'uxp-vite-integration',
  
  hooks: {
    /**
     * Hook into the express lifecycle BEFORE Vite plugin
     * to fetch PC data and inject it into HTML responses
     */
    express: {
      timing: {
        before: ['@gasket/plugin-vite']
      },
      handler: function (gasket: any, app: any) {
        // Middleware 1: Fetch PC data and attach to request
        app.use(async (req: any, res: any, next: any) => {
          try {
            // Fetch Presentation Central data for this request
            const pcContent = await gasket.actions.getPresentationCentral(req);
            
            // Normalize v3 to v2 if needed (v3 has components)
            if ('components' in pcContent.data) {
              const { normalizeManifest } = await import('./normalize-manifest.js');
              pcContent.data = normalizeManifest(pcContent.data);
              gasket.logger.debug('[uxp-vite-integration] Normalized v3 → v2');
            }
            
            // Store data on the request object
            req.pcContent = pcContent;
            
            gasket.logger.debug(`[uxp-vite-integration] ✅ PC data fetched`);
          } catch (error) {
            gasket.logger.error('[uxp-vite-integration] Error fetching Presentation Central:', error);
            req.pcContent = { data: {}, meta: {}, error };
          }
          
          next();
        });
        
        // Middleware 2: Intercept HTML responses and inject UXP content
        app.use((req: any, res: any, next: any) => {
          const originalSend = res.send;
          
          res.send = function(body: any) {
            // Only process HTML responses with PC content
            const contentType = res.get('Content-Type') || '';
            if (!contentType.includes('text/html') || !req.pcContent?.data) {
              return originalSend.call(this, body);
            }
            
            try {
              const { data } = req.pcContent;
              let html = body.toString();
              
              // Inject <head> assets (CSS, preconnect, preload, etc.)
              const headAssets = [
                data.assets?.css || '',
                data.assets?.preload || '',
                data.hints?.preconnect || '',
                data.hints?.dnsprefetch || '',
                data.hints?.preload?.css || '',
                data.hints?.preload?.fonts || ''
              ].filter(Boolean).join('\n');
              
              if (headAssets) {
                html = html.replace('</head>', `${headAssets}\n</head>`);
              }
              
              // Inject header after <body> tag
              const header = data.header || '';
              if (header) {
                html = html.replace(/(<body[^>]*>)/i, `$1\n<div id="uxp-header">${header}</div>`);
              }
              
              // Inject footer and scripts before </body>
              const footerContent = [
                data.footer ? `<div id="uxp-footer">${data.footer}</div>` : '',
                data.globals || '',
                data.assets?.js || '',
                data.loaders || ''
              ].filter(Boolean).join('\n');
              
              if (footerContent) {
                html = html.replace('</body>', `${footerContent}\n</body>`);
              }
              
              gasket.logger.debug('[uxp-vite-integration] ✅ Injected UXP content');
              
              return originalSend.call(this, html);
            } catch (error) {
              gasket.logger.error('[uxp-vite-integration] Error injecting UXP content:', error);
            }
            
            // Fallback to original if anything fails
            return originalSend.call(this, body);
          };
          
          next();
        });
      }
    }
  }
};

