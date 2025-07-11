import type { Plugin } from '@gasket/core';

declare module '@gasket/core' {
  export interface GasketConfig {
    docs?: {
      outputDir?: string;
      graphs?: boolean;
    };
  }
}

declare const plugin: Plugin;

export default plugin;


