import type { GasketConfig, HookExecTypes } from '@gasket/engine';
import type WebpackApi from 'webpack';

export interface WebpackContext {
  webpack: typeof WebpackApi,
  webpackMerge: any
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    webpack?: any  // TODO: Use types when upgrading to next version of `webpack-merge`
  }

  export interface HookExecTypes {
    webpackConfig(
      config: WebpackApi.Configuration,
      context: WebpackContext
    ): WebpackApi.Configuration;
  }
}
