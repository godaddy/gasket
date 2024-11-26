// Imports use the .js to support a type module application
// See README for more information
import gasket from './gasket.js';
{{#if apiApp }}
import './routes/index.js';
{{/if}}
{{#if nextDevProxy }}
gasket.actions.startProxyServer();
{{else}}
gasket.actions.startServer();
{{/if}}
