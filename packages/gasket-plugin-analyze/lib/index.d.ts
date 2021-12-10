import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

declare module '@gasket/engine' {
  export interface GasketConfig {
    bundleAnalyzerConfig?: {
      browser?: BundleAnalyzerPlugin.Options,
      server?: BundleAnalyzerPlugin.Options
    }
  }
}
