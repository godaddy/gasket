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
  /** Config name */
  name: string;
  path: string;
}

declare const plugin: Plugin;

export default plugin;

