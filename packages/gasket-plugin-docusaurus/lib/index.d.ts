declare module '@gasket/engine' {
  export interface GasketConfig {
    docusaurus?: {
      rootDir?: string,
      docsDir?: string,
      port?: number,
      host?: string
    }
  }
}
