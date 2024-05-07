import type { WebpackContext } from '@gasket/plugin-webpack';
import type { IncomingMessage, ServerResponse } from 'http';
// @ts-ignore
import type { NextConfig } from 'next/dist/next-server/server/config-shared';
// @ts-ignore
import type NextServer from 'next/dist/next-server/server/next-server';
import type { Application } from 'express';


export { NextConfig, NextServer };

export type NextConfigFunction = (phase: string, context: {
  defaultConfig: NextConfig,
  isServer: boolean
}) => Promise<NextConfig>;

declare module '@gasket/core' {

  export interface GasketActions {
    getNextConfig(config?: NextConfig | NextConfigFunction): (phase: string, context?: {}) => Promise<NextConfig>
  }

  export interface GasketConfig {
    nextConfig?: Partial<NextConfig>
  }

  export interface HookExecTypes {
    nextConfig(config: NextConfig): MaybeAsync<NextConfig>,
    next(nextServer: NextServer): MaybeAsync<void>,
    nextExpress(params: {
      next: NextServer,
      express: Application
    }): MaybeAsync<void>,
    nextPreHandling(params: {
      nextServer: NextServer,
      context: {
        req: IncomingMessage,
        res: ServerResponse
      }
    }): MaybeAsync<void>
  }
}

declare module '@gasket/plugin-webpack' {
  export interface WebpackContext {
    isServer: boolean;
  }
}

declare module 'http' {
  export interface IncomingMessage {
    getNextRoute(): Promise<null | {
      page: string,
      regex: RegExp,
      routeKeys: Record<string, string>,
      namedRegex: RegExp
    }>
  }
}
