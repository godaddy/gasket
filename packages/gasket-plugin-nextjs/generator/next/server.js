import gasket from './gasket.js';
{{#if nextDevProxy}}
gasket.actions.startProxyServer();
{{else}}
gasket.actions.startServer();
{{/if}}
