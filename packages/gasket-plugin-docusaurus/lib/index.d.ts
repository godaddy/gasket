import type { Plugin } from '@gasket/core';

declare module '@gasket/core' {
  export interface GasketConfig {
    docusaurus?: DocusaurusConfig;
  }
}

export interface BaseConfig {
  /** Preset name */
  name: string;
  path: string;
}

export interface DocusaurusConfig {
  rootDir?: string;
  docsDir?: string;
  port?: string;
  host?: string;
}

const plugin: Plugin = {
  name: '@gasket/plugin-docusaurus',
  hooks: {}
};

export = plugin;
