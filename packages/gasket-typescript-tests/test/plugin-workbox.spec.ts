import type { GasketConfigDefinition, Plugin } from '@gasket/core';
import '@gasket/plugin-workbox';

describe('@gasket/plugin-workbox', () => {
  it('adds a workbox config section to Gasket', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      workbox: {
        config: {
          runtimeCaching: [{
            urlPattern: /.png$/,
            handler: 'cacheFirst'
          }]
        }
      }
    };
  });

  it('adds a workbox lifecycle', () => {
    const plugin: Plugin = {
      name: 'fake-plugin',
      version: '',
      description: '',
      hooks: {
        workbox: function (gasket, config, context) {
          // `config` is the initial workbox config
          // `context` is the service-worker context.
          const { req, res } = context;
          if (req) {
            // adjust config for request-based service workers using headers, cookies, etc.
          }

          // return a config partial which will be merged
          return {
            runtimeCaching: [{
              urlPattern: /https:\/\/some.api.com/,
              handler: 'networkFirst'
            }]
          };
        }
      }
    };
  });
});
