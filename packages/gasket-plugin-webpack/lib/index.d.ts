import type { Plugin } from '@gasket/core';
import type WebpackApi from 'webpack';
import type { Configuration } from 'webpack';

export interface WebpackContext {
  webpack: typeof WebpackApi;
  isServer?: boolean;
}

export interface WebpackMetrics {
  name: string;
  event: string;
  data: object;
  time: number;
}

declare module '@gasket/core' {
  export interface GasketActions {
    getWebpackConfig: (
      config: Configuration,
      context: Omit<WebpackContext, 'webpack'>
    ) => Configuration;
  }

  export interface HookExecTypes {
    webpackConfig(
      config: Configuration,
      context: WebpackContext
    ): Configuration;
  }
}

declare const plugin: Plugin;

export default plugin;
