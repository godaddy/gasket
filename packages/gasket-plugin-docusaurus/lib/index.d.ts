declare module '@gasket/core' {
  export interface GasketConfig {
    docusaurus?: {
      rootDir?: string,
      docsDir?: string,
      port?: number,
      host?: string
    }
  }
}
