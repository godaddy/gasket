import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

declare module '@gasket/core' {
  export interface GasketConfig {
    bundleAnalyzerConfig?: {
      browser?: BundleAnalyzerPlugin.Options,
      server?: BundleAnalyzerPlugin.Options
    }
  }
}
