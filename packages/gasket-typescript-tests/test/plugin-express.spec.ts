import type { Gasket, GasketConfigFile, Hook } from '@gasket/engine';
import type { Application } from 'express';
import '@gasket/plugin-express';

describe('@gasket/plugin-express', () => {
  it('adds a compression config property', () => {
    const config: GasketConfigFile = {
      express: {
        compression: false
      }
    };
  });

  it('adds an excludedRoutesRegex config property', () => {
    const config: GasketConfigFile = {
      express: {
        excludedRoutesRegex: /^(?!\/_next\/)/
      }
    };
  });

  it('adds an middlewareInclusionRegex config property', () => {
    const badConfig: GasketConfigFile = {
      // @ts-expect-error
      middlewareInclusionRegex: '/api/*'
    };

    const goodConfig: GasketConfigFile = {
      express: {
        middlewareInclusionRegex: /^(?!\/_next\/)/
      }
    };
  });

  it('adds an routes config property', () => {
    const badConfig: GasketConfigFile = {
      // @ts-expect-error
      routes: /^\/api\/\.*$/
    };

    const goodConfig: GasketConfigFile = {
      express: {
        routes: '/api/*.js'
      }
    };
  });

  it('declares the middleware lifecycle', () => {
    const hook: Hook<'middleware'> = (gasket: Gasket, app) => {
      return [];
    };
  });

  it('validates the middleware return value', () => {
    // @ts-expect-error
    const hook: Hook<'middleware'> = (gasket: Gasket, app: Application) => {
      return 'huh?';
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
