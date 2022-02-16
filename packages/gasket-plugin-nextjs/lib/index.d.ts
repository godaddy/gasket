import type { WebpackContext } from '@gasket/plugin-webpack';
import type { NextConfig } from 'next/dist/next-server/server/config-shared';
import type NextServer from 'next/dist/next-server/server/next-server';
import type { Application } from 'express';

export { NextConfig, NextServer };

declare module '@gasket/engine' {
  export interface GasketConfig {
    nextConfig?: Partial<NextConfig>
  }

  export interface HookExecTypes {
    nextConfig(config: NextConfig): MaybeAsync<NextConfig>,
    next(nextServer: NextServer): MaybeAsync<void>,
    nextExpress(params: {
      next: NextServer,
      express: Application
    }): MaybeAsync<void>
  }
}

declare module '@gasket/plugin-webpack' {
  export interface WebpackContext {
    isServer: boolean;
  }
}
