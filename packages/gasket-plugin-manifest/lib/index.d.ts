import type { MaybeAsync } from '@gasket/core';
import type { IncomingMessage, OutgoingMessage } from 'http'

export type Manifest = {
  short_name: string,
  name: string,
  path: string,
  staticOutput: string
}

declare module '@gasket/core' {
  export interface GasketConfig {
    manifest?: boolean | Partial<Manifest>
  }

  export interface HookExecTypes {
    manifest(
      initManifest: Manifest,
      context: { req: IncomingMessage, res: OutgoingMessage }
    ): MaybeAsync<Manifest>
  }
}
