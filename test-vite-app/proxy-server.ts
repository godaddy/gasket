/**
 * HTTPS Proxy Server for Local Development
 *
 * This starts an HTTPS proxy server that allows you to access the app via:
 *   https://local.gasket.dev-godaddy.com:8443
 *
 * The proxy forwards requests to the main app server running on localhost:3000
 *
 * This is essential for testing:
 * - SSO authentication (jomax realm) which requires *.dev-godaddy.com domains
 * - Secure cookies
 * - HTTPS-only features
 *
 * Usage:
 *   npm run local
 *
 * This command automatically starts BOTH the main app AND this proxy server
 * using concurrently, just like the Gasket webapp template.
 */

import gasket from './gasket.js';

gasket.actions.startProxyServer();

