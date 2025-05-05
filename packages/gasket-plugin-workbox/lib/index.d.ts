import type { PartialRecursive, MaybeAsync, Plugin } from '@gasket/core';
import type { GenerateSWConfig } from 'workbox-build';
import type { Request, Response } from 'express';
import type { Gasket } from '@gasket/core';

export interface WorkboxConfig {
  /**
   * path of directory to copy Workbox libraries to (default:
   * ./build/workbox)
   */
  outputDir?: string;

  /**
   * change the default path to /_workbox endpoint by adding a path prefix
   * here. (default: ''). Used for setting up CDN support for Workbox
   * files.
   */
  basePath?: string;

  /**
   * Any initial workbox config options which will be merged with those
   * from any workbox lifecycle hooks.
   */
  config?: PartialRecursive<GenerateSWConfig>;
  libraryVersion?: string;
}

declare module '@gasket/core' {
  export interface GasketConfig {
    workbox?: WorkboxConfig;
    basePath?: string;
  }

  export interface HookExecTypes {
    workbox(
      config: GenerateSWConfig,
      context: { req?: Request; res?: Response }
    ): MaybeAsync<PartialRecursive<GenerateSWConfig>>;
  }
}

export function getWorkboxConfig({ config: GasketConfig }): WorkboxConfig;
export function getOutputDir(gasket: Gasket): string;
export function getBasePath({ config: GasketConfig }): string;

declare const plugin: Plugin;

export default plugin;
