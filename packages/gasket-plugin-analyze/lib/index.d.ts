import type { Plugin } from '@gasket/core';
import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

declare module '@gasket/core' {
  export interface GasketConfig {
    bundleAnalyzerConfig?: {
      browser?: BundleAnalyzerPlugin.Options,
      server?: BundleAnalyzerPlugin.Options
    }
  }
}

declare const plugin: Plugin;

export default plugin;
