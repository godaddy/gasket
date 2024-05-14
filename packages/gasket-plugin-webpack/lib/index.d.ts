import type { GasketConfig, HookExecTypes } from '@gasket/engine';
import { Gasket } from '@gasket/engine';
import type WebpackApi from 'webpack';
import type { Configuration } from 'webpack';
import type WebpackChain from 'webpack-chain';

export interface WebpackContext {
  webpack: typeof WebpackApi;
  /** @deprecated use require('webpack-merge') */
  webpackMerge: any;
  isServer?: boolean;
}

export interface WebpackMetrics {
  name: string;
  event: string;
  data: object;
  time: number;
}

declare module '@gasket/engine' {
  export interface GasketConfig {
    webpack?: any;
  }

  export interface HookExecTypes {
    webpackConfig(
      config: Configuration,
      context: WebpackContext
    ): Configuration;
    webpackChain(chain: WebpackChain, context: object): void;
    webpack(baseConfig: object, context: object): void;
    metrics(metrics: WebpackMetrics): Promise<void>;
  }
}

declare module '@gasket/plugin-webpack' {
  /** Creates the webpack config */
  export function initWebpack(
    gasket: Gasket,
    /** Initial webpack config */
    initConfig: Configuration,
    /** Additional context-specific information */
    context: any
  ): Configuration;
}
