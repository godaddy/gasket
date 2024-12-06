import type { Plugin, Gasket } from '@gasket/core';

declare module '@gasket/core' {
  export interface GasketConfig {
    dynamicPlugins?: string[];
  }
}

const plugin: Plugin = {
  name: '@gasket/plugin-dynamic-plugins',
  hooks: {}
};

export default plugin;
