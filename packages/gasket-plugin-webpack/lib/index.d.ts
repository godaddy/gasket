import type { GasketConfig, HookExecTypes } from '@gasket/engine';
import type WebpackApi from 'webpack';

export interface WebpackContext {
  webpack: typeof WebpackApi
}

declare module '@gasket/engine' {
  export interface GasketActions {
    getWebpackConfig(config: WebpackApi.Configuration, context: WebpackContext): WebpackApi.Configuration
  }

  export interface HookExecTypes {
    webpackConfig(
      config: WebpackApi.Configuration,
      context: WebpackContext
    ): WebpackApi.Configuration;
  }
}
