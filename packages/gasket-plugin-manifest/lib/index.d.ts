import type { MaybeAsync } from '@gasket/engine';
import type { IncomingMessage, OutgoingMessage } from 'http'

export type Manifest = {
  short_name: string,
  name: string,
  path: string,
  staticOutput: string
}

declare module '@gasket/engine' {
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
