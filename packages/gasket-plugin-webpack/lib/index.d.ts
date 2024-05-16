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
    getWebpackConfig?: (config: WebpackApi.Configuration, context: WebpackContext) => WebpackApi.Configuration
  }

  export interface HookExecTypes {
    webpackConfig(
      config: Configuration,
      context: WebpackContext
    ): Configuration;
    metrics(metrics: WebpackMetrics): Promise<void>;
  }
}

// satisfies plugin imports
export default {
  name: '@gasket/plugin-webpack',
  hooks: {}
}
