import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginLogger from '@gasket/plugin-logger';
import pluginVite from '@gasket/plugin-vite';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';

// Custom plugin to expose visitor info via API
const visitorApiPlugin = {
  name: 'visitor-api-plugin',
  hooks: {
    express: {
      timing: {
        before: ['@gasket/plugin-vite']
      },
      handler: async function (gasket: any, app: any) {
        // API endpoint to get visitor information
        app.get('/api/visitor', async (req: any, res: any) => {
          try {
            const visitor = await gasket.actions.getVisitor(req);
            res.json(visitor);
          } catch (error) {
            gasket.logger.error('Error getting visitor info:', error);
            res.status(500).json({ error: 'Failed to get visitor info' });
          }
        });
      }
    }
  }
};

export default makeGasket({
  plugins: [
    pluginHttps,
    pluginExpress,
    pluginLogger,
    pluginVisitor,      // Provides visitor info (plid, market, etc.)
    visitorApiPlugin,   // Custom plugin for API endpoint
    pluginVite
  ],
  
  http: 3000
} as GasketConfigDefinition);
