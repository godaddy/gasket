import type { GasketConfigDefinition, Plugin } from '@gasket/engine';
import '@gasket/preset-pwa';

describe('@gasket/preset-pwa', () => {
  it('imports config type injections for all plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      workbox: {},
      serviceWorker: {}
    };
  });

  it('imports lifecycles for all plugins', () => {
    const plugin: Plugin = {
      name: 'dummy-plugin',
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
