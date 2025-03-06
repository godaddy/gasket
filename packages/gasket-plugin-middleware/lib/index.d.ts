import type { Plugin, MaybeAsync, MaybeMultiple, Handler } from '@gasket/core';

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
    _implicitHeader?: () => void;
  }
}

declare module '@gasket/core' {
  export interface HookExecTypes {
    middleware(): MaybeAsync<MaybeMultiple<Handler> & {
      paths?: (string | RegExp)[]
    }>;
  }
}

declare const plugin: Plugin;
export default plugin;
