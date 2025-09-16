/* eslint-disable vitest/expect-expect, jest/expect-expect */
/// <reference types="@gasket/plugin-https-proxy" />

import type { GasketConfigDefinition, Hook } from '@gasket/core';
// import type { ServerOptions as ProxyServerOptions } from 'http-proxy';
// import '@gasket/plugin-https-proxy';

describe('@gasket/plugin-https-proxy', () => {
  const { log } = console;

  it('adds an optional httpsProxy config property', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        protocol: 'https',
        hostname: 'localhost',
        port: 8443,
        target: {
          host: 'localhost',
          port: 3000
        }
      }
    };
  });

  it('supports target config', () => {
    const stringTarget: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: 'http://localhost:3000'
      }
    };

    const objectTarget: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: {
          host: 'localhost',
          port: 3000,
          protocol: 'http:'
        }
      }
    };

    const badTarget: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        // @ts-expect-error - must be string or object
        target: 12345
      }
    };
  });

  it('supports forward config', () => {
    const stringForward: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        forward: 'https://example.com'
      }
    };

    const urlForward: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        forward: new URL('https://example.com:443')
      }
    };

    const badForward: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        // @ts-expect-error - must be string or object
        forward: Symbol('bad idea')
      }
    };
  });

  it('supports target object with different properties', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: {
          host: 'api.example.com',
          port: 8080,
          protocol: 'https:'
        }
      }
    };
  });

  it('supports SSL configuration', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: 'http://localhost:3000',
        ssl: {
          key: '/path/to/key.pem',
          cert: '/path/to/cert.pem'
        }
      }
    };
  });

  it('supports proxy server options', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: 'http://localhost:3000',
        xfwd: true,
        ws: true,
        changeOrigin: true,
        secure: false,
        toProxy: true,
        prependPath: false,
        ignorePath: false,
        localAddress: '127.0.0.1'
      }
    };
  });

  it('supports environment-specific config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      environments: {
        development: {
          httpsProxy: {
            target: 'http://localhost:3000',
            port: 8443
          }
        },
        production: {
          httpsProxy: {
            target: 'http://app:3000',
            port: 443,
            ssl: {
              key: '/etc/ssl/private/key.pem',
              cert: '/etc/ssl/certs/cert.pem'
            }
          }
        }
      }
    };
  });

  it('supports complex target configuration with authentication', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: {
          host: 'secure-api.example.com',
          port: 443,
          protocol: 'https:',
          auth: 'username:password'
        },
        changeOrigin: true,
        secure: true
      }
    };
  });

  it('adds the prebootHttpsProxy lifecycle', () => {
    const handler: Hook<'prebootHttpsProxy'> = async (gasket) => {
      log('Preparing to start HTTPS proxy server');
    };
  });

  it('adds the httpsProxy lifecycle with config modification', () => {
    const handler: Hook<'httpsProxy'> = (gasket, proxyConfig) => {
      return {
        ...proxyConfig,
        xfwd: true,
        secure: false
      };
    };
  });

  it('validates httpsProxy lifecycle return type', () => {
    // @ts-expect-error
    const handler: Hook<'httpsProxy'> = (gasket, proxyConfig) => {
      return {
        invalidProperty: 'should error'
      };
    };
  });

  it('supports startProxyServer action', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      httpsProxy: {
        target: 'http://localhost:3000'
      }
    };

    // This would be used in lifecycle hooks or actions
    // const proxyServer = await gasket.actions.startProxyServer();
  });

  it('requires at least target or forward', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      // @ts-expect-error - should require at least target or forward
      httpsProxy: {
        protocol: 'https',
        hostname: 'localhost',
        port: 8443
      }
    };
  });
});
