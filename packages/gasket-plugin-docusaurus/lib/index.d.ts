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

export default {
  name: '@gasket/plugin-docusaurus',
  version: '',
  description: '',
  hooks: {}
};
