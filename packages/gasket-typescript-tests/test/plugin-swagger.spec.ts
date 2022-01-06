import { GasketConfigFile } from "@gasket/engine";
import '@gasket/plugin-swagger';

describe('@gasket/plugin-swagger', () => {
  it('adds a swagger config section to Gasket', () => {
    const config: GasketConfigFile = {
      swagger: {
        jsdoc: {
          definition: {
            openapi: '3.0.0',
            info: {
              title: 'Theme API',
              version: '1.0.0'
            }
          },
          apis: ['api.js']
        },
        definitionFile: 'swagger.json',
        apiDocsRoute: '/api-docs'
      }
    }
  });
});
