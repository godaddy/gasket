import type { MaybeAsync } from '@gasket/core';
import type { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';

export type Manifest = {
  short_name?: string;
  name?: string;
  path?: string;
  staticOutput?: string | boolean;
};

export async function manifestMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
): Promise<void>;

declare module '@gasket/core' {
  export interface GasketConfig {
    manifest?: Manifest;
  }

  export interface HookExecTypes {
    manifest(
      initManifest: Manifest,
      context: { req?: IncomingMessage; res?: OutgoingMessage }
    ): MaybeAsync<Manifest>;
  }
}

declare module '@types/express-serve-static-core' {
  interface Request {
    manifest?: Manifest;
  }
}

declare module 'http' {
  export interface IncomingMessage {
    manifest?: Manifest;
    path?: string;
  }
}

export default {
  name: '@gasket/plugin-manifest',
  hooks: {}
};

