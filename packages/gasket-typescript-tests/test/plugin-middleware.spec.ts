import { describe, it, expect } from 'vitest';
import type { Plugin, Gasket } from '@gasket/core';
import type { Handler as MiddlewareHandler } from '@gasket/plugin-middleware';
import type { Handler as ExpressHandler, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('@gasket/plugin-middleware types', () => {
  it('allows express Handler to be used as middleware', () => {
    const expressMiddleware: ExpressHandler = (req: ExpressRequest, res: ExpressResponse, next) => {
      next();
    };

    const middlewareArray: MiddlewareHandler[] = [expressMiddleware];

    expect(middlewareArray).toBeDefined();
  });

  it('works seamlessly with express middleware in plugin hook', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
      hooks: {
        middleware: (gasket: Gasket) => [
          (req: ExpressRequest, res: ExpressResponse, next) => {
            req.url = '/modified';
            next();
          }
        ]
      }
    };

    expect(plugin).toBeDefined();
  });

  it('allows fastify-style handlers to be used as middleware', () => {
    const fastifyMiddleware = (req: FastifyRequest, reply: FastifyReply, next: (error?: Error) => void) => {
      next();
    };

    const middlewareArray: MiddlewareHandler[] = [fastifyMiddleware];

    expect(middlewareArray).toBeDefined();
  });

  it('works seamlessly with fastify middleware in plugin hook', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
      hooks: {
        middleware: (gasket: Gasket) => [
          (req: FastifyRequest, reply: FastifyReply, next: (error?: Error) => void) => {
            reply.header('x-custom', 'value');
            next();
          }
        ]
      }
    };

    expect(plugin).toBeDefined();
  });
});
