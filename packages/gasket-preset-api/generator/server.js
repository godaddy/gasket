import gasket from './gasket.js';
{{#if apiApp }}
import './routes/index.js';
{{/if}}

gasket.actions.startServer();
