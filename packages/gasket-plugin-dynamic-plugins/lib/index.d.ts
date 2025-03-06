import type { Plugin } from '@gasket/core';

declare module '@gasket/core' {
  export interface GasketConfig {
    dynamicPlugins?: string[];
  }
}

declare const plugin: Plugin;
export default plugin;
