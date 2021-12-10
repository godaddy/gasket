import { GasketConfigFile, Plugin } from "@gasket/engine";
import { Request } from 'express'
import '@gasket/plugin-service-worker';

describe('@gasket/plugin-service-worker', () => {
  it('adds a serviceWorker section to the Gasket config', () => {
    const config: GasketConfigFile = {
      serviceWorker: {
        url: '/docs/server-worker.js',
        cache: {
          maxAge: 1000 * 60
        },
        scope: '/docs',
        minify: {
          ie8: true
        }
      }
    }
  });

  it('adds a composeServiceWorker lifecycle', () => {
    const plugin: Plugin = {
      name: 'some-plugin',
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
          `)
        }
      }
    }    
  });

  it('adds a serviceWorkerCacheKey lifecycle', () => {
    const plugin: Plugin = {
      name: "some-plugin",
      hooks: {
        serviceWorkerCacheKey: () => (req, res) => (req as Request).cookies.market || 'en-US'
      }
    }
  });
});
