import type { MaybeAsync } from '@gasket/engine';
import { Gasket } from '@gasket/engine';
import type { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';

export type Manifest = {
  short_name?: string;
  name?: string;
  path?: string;
  staticOutput?: string | boolean;
};

export function gatherManifestData(
  gasket: Gasket,
  context: {
    req?: IncomingMessage & {
      originalUrl?: string;
    };
    res?: OutgoingMessage;
  }
): MaybeAsync<Manifest>;

export async function manifestMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
): Promise<void>;

declare module '@gasket/engine' {
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
