import type { MaybeAsync, Plugin } from '@gasket/core';
import type { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';

export type Manifest = {
  short_name?: string;
  name?: string;
  path?: string;
  staticOutput?: string | boolean;
};

export function manifestMiddleware(
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

declare module 'express-serve-static-core' {
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

declare const plugin: Plugin;

export default plugin;
