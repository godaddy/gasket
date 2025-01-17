import type { Plugin } from '@gasket/core';

export interface DocusaurusConfig {
  rootDir?: string;
  docsDir?: string;
  port?: string;
  host?: string;
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    useDocusaurus?: boolean;
  }
}

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

const plugin: Plugin = {
  name: '@gasket/plugin-docusaurus',
  hooks: {}
};

export = plugin;
