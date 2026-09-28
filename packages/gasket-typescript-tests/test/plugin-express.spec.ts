/* eslint-disable vitest/expect-expect */
import type { Gasket, GasketConfigDefinition, Hook } from '@gasket/core';
import type { Application } from 'express';
import '@gasket/plugin-express';

describe('@gasket/plugin-express', () => {
  it('adds a compression config property', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      express: {
        compression: false
      }
    };
  });

  it('accepts every trustProxy form Express supports', () => {
    const forms: GasketConfigDefinition['express'][] = [
      { trustProxy: true },
      { trustProxy: 1 },
      { trustProxy: '10.0.0.0/8, 172.16.0.0/12' },
      { trustProxy: ['10.0.0.0/8', '172.16.0.0/12'] },
      { trustProxy: (ip: string) => ip === '127.0.0.1' }
    ];
  });

  it('declares the express lifecycle', () => {
    const hook: Hook<'express'> = (gasket: Gasket, app: Application) => {
      app.use((req, res, next) => next());
    };
  });

  it('declares the errorMiddleware lifecycle', () => {
    const hook: Hook<'errorMiddleware'> = (gasket: Gasket) => [
      (err, req, res, next) => {
        // eslint-disable-next-line no-console
        console.error(err);
        next(err);
      }
    ];
  });
});
