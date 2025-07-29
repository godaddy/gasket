/* eslint-disable vitest/expect-expect, jest/expect-expect */
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
