import type { Plugin, Gasket, MaybeAsync, MaybeMultiple } from '@gasket/core';
import type { FastifyReply, FastifyInstance } from 'fastify';
import type { Application as ExpressApp, Request } from 'express';
import type {
  Http2SecureServer,
  Http2ServerRequest,
  Http2ServerResponse
} from 'http2';

/** Type alias for Fastify application with HTTP/2 support */
type FastifyApp<
  Server = Http2SecureServer,
  Request = Http2ServerRequest,
  Response = Http2ServerResponse
> = FastifyInstance<Server, Request, Response>;

declare namespace Internal {
  /** Applies the cookie parser based on the middleware pattern. */
  function applyCookieParser(
    app: FastifyApp | ExpressApp,
    middlewarePattern: RegExp
  ): void;

  /** Applies compression to the application if a compression config is present. */
  function applyCompression(
    app: ExpressApp | FastifyApp,
    compressionConfig: boolean
  ): void;

  /** Executes the middleware lifecycle for the application */
  function executeMiddlewareLifecycle(
    gasket: Gasket,
    app: ExpressApp | FastifyApp,
    middlewarePattern: RegExp
  ): void;

  /** Attaches a log enhancer to the Express Request object. */
  function attachLogEnhancer(req: Request): void;
}

declare module 'fastify' {
  interface FastifyReply {
    locals: Record<string, any>;
  }
}

declare module 'express-serve-static-core' {
  interface Response {
    /*
     * This is a patch for the undocumented _implicitHeader used by the
     * compression middleware which is not present on the http2 request object.
     * @see: https://github.com/expressjs/compression/pull/128
     * and also, by the 'compiled' version in Next.js
     * @see: https://github.com/vercel/next.js/issues/11669
     */
    _implicitHeader: () => void;
  }
}

declare module 'express' {
  interface Request {
    logger: {
      metadata: Function;
      child: Function;
    };
  }
}

declare module '@gasket/core' {
  export interface HookExecTypes {
    middleware(): MaybeAsync<MaybeMultiple<Handler>>;
  }
}
