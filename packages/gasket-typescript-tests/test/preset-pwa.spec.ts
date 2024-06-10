import type { GasketConfigDefinition, Plugin } from '@gasket/core';
import preset from '@gasket/preset-pwa';

describe('@gasket/preset-pwa', () => {
  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      workbox: {},
      serviceWorker: {}
    };
  });

  it('imports lifecycles for all plugins', () => {
    const plugin: Plugin = {
      name: 'dummy-plugin',
      version: '',
      description: '',
      hooks: {
        composeServiceWorker(gasket, script) {
          return `${script}; function otherStuff() { }`;
        },
        serviceWorkerCacheKey(gasket) {
          return (req) => `${req.url}-${req.headers['accept-language']}`;
        }
      }
    };
  });
});
