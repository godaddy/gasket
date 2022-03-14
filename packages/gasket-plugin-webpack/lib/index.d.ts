import type { GasketConfig, HookExecTypes } from '@gasket/engine';
import type WebpackApi from 'webpack';

export interface WebpackContext {
  webpack: typeof WebpackApi,
  /** @deprecated use require('webpack-merge') */
  webpackMerge: any
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    webpack?: any
  }

  export interface HookExecTypes {
    webpackConfig(
      config: WebpackApi.Configuration,
      context: WebpackContext
    ): WebpackApi.Configuration;
  }
}
