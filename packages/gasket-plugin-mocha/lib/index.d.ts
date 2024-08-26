import type { Plugin } from '@gasket/core';

const plugin: Plugin = {
  name: '@gasket/plugin-mocha',
  hooks: {}
};

declare module 'create-gasket-app' {
  export interface CreateContext {
    /** Flag indicating if typescript is enabled */
    typescript?: boolean;
  }
}

export = plugin;
