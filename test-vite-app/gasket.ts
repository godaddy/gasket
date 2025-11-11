import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';
import pluginIntl from '@gasket/plugin-intl';
import pluginLogger from '@gasket/plugin-logger';
import pluginVite from '@gasket/plugin-vite';
import pluginAuth from '@godaddy/gasket-plugin-auth';
import pluginDevCerts from '@godaddy/gasket-plugin-dev-certs';
import pluginSelfCerts from '@godaddy/gasket-plugin-self-certs';
import pluginUxp from '@godaddy/gasket-plugin-uxp';
import pluginVisitor from '@godaddy/gasket-plugin-visitor';
import uxpViteIntegration from './uxp-vite-integration.js';

// Custom plugin to expose visitor info via API (useful for debugging)
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
    pluginDevCerts,       // Downloads and manages SSL certificates for local dev
    pluginSelfCerts,      // Provides self-signed certs for local HTTPS
    pluginHttpsProxy,     // HTTPS proxy for local dev with *.dev-godaddy.com hostname
    pluginExpress,
    pluginLogger,
    pluginIntl,           // Internationalization support
    pluginVisitor,        // Provides visitor info (plid, market, etc.)
    pluginAuth,           // Adds authentication support (SSO integration)
    pluginUxp,            // Adds UX Platform support (Presentation Central & UXCore2)
    uxpViteIntegration,   // Integrates UXP headers with Vite SSR rendering
    visitorApiPlugin,     // Custom plugin for visitor API endpoint (debugging)
    pluginVite
  ],
  
  http: 3000,
  
  // HTTPS Proxy configuration for local development with dev-godaddy.com domain
  // This allows testing SSO authentication which requires a *.dev-godaddy.com hostname
  httpsProxy: {
    protocol: 'https',
    hostname: 'local.gasket.dev-godaddy.com',
    port: 8443,
    xfwd: true,
    ws: true,
    target: {
      host: 'localhost',
      port: 3000
    }
  },
  
  // Auth configuration for employee authentication
  auth: {
    appName: 'test-vite-app',
    realm: 'jomax'  // Employee authentication via Active Directory
  },
  
  // UXP configuration
  // Supports both v2 and v3 API - automatically normalizes v3 to v2 format
  presentationCentral: {
    version: '3.0',  // v3 is recommended (default)
    params: {
      app: 'test-vite-app',
      manifest: 'internal-header',  // v3 uses 'manifest'
      privateLabelId: 1,             // GoDaddy brand (overridden by visitor plugin on localhost)
      deferjs: true                  // v3 supports defer scripts
    }
  },
  
  // Internationalization configuration
  intl: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'es-MX', 'fr-FR'],
    localesDir: 'public/locales',
    managerFilename: 'intl.ts'
  }
  
  // NOTE: On localhost, visitor plugin defaults to PLID 3153 (no brand).
  // To see GoDaddy branding (PLID 1), access with query param:
  //   http://localhost:3000?plid=1
  
  // To use v2 API instead, uncomment:
  // presentationCentral: {
  //   version: '2.0',
  //   params: {
  //     app: 'test-vite-app',
  //     header: 'internal-header'  // v2 uses 'header' instead of 'manifest'
  //   }
  // }
} as GasketConfigDefinition);
