import { GasketConfigDefinition, Plugin } from '@gasket/core';
import { Request } from 'express';
import '@gasket/plugin-service-worker';

describe('@gasket/plugin-service-worker', () => {
  it('adds a serviceWorker section to the Gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      serviceWorker: {
        url: '/docs/server-worker.js',
        cache: {
          maxAge: 1000 * 60
        },
        scope: '/docs',
        minify: true
      }
    };
  });

  it('adds a composeServiceWorker lifecycle', () => {
    const plugin: Plugin = {
      name: 'some-plugin',
      version: '',
      description: '',
      hooks: {
        composeServiceWorker: function (gasket, content, context) {
          return content.concat(`
            self.addEventListener('push', (event) => {
              const title = 'My App Notification';
              const options = {
                body: event.data.text()
              };
              event.waitUntil(self.registration.showNotification(title, options));
            });
          `);
        }
      }
    };
  });

  it('adds a serviceWorkerCacheKey lifecycle', () => {
    const plugin: Plugin = {
      name: 'some-plugin',
      version: '',
      description: '',
      hooks: {
        serviceWorkerCacheKey: () => (req, res) => (req as Request).cookies.market || 'en-US'
      }
    };
  });
});
