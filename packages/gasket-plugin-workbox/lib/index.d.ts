import type { IncomingMessage, OutgoingMessage } from 'http';
import type { PartialRecursive } from '@gasket/engine';
import type { GenerateSWConfig } from 'workbox-build';

declare module '@gasket/engine' {
  export interface GasketConfig {
    workbox?: {
      /** path of directory to copy Workbox libraries to (default:
       * ./build/workbox) */
      outputDir?: string,

      /** change the default path to /_workbox endpoint by adding a path prefix
       * here. (default: ''). Used for setting up CDN support for Workbox
       * files. */
      basePath?: string,

      /** Any initial workbox config options which will be merged with those
       * from any workbox lifecycle hooks. */
      config?: PartialRecursive<GenerateSWConfig>
    }
  }

  export interface HookExecTypes {
    workbox(
      config: GenerateSWConfig,
      context: { req?: IncomingMessage, res?: OutgoingMessage }
    ): MaybeAsync<PartialRecursive<GenerateSWConfig>>
  }
}
