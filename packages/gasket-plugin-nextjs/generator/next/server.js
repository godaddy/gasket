import gasket from './gasket.js';
{{/if}}
{{#if nextDevProxy }}
gasket.actions.startProxyServer();
{{else}}
gasket.actions.startServer();
{{/if}}
