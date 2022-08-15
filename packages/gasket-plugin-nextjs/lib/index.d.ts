import type { WebpackContext } from '@gasket/plugin-webpack';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextConfig } from 'next/dist/next-server/server/config-shared';
import type NextServer from 'next/dist/next-server/server/next-server';
import type { MaybeAsync } from '@gasket/engine';
import type { Application } from 'express';

export { NextConfig, NextServer };

declare module '@gasket/engine' {
  export interface GasketConfig {
    nextConfig?: Partial<NextConfig>;
  }

  export interface HookExecTypes {
    nextConfig(config: NextConfig): MaybeAsync<NextConfig>;
    next(nextServer: NextServer): MaybeAsync<void>;
    nextExpress(params: {
      next: NextServer;
      express: Application;
    }): MaybeAsync<void>;
    nextPreHandling(params: {
      next: NextServer;
      req: IncomingMessage;
      res: ServerResponse;
    }): MaybeAsync<void>;
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
      page: string;
      regex: RegExp;
      routeKeys: Record<string, string>;
      namedRegex: RegExp;
    }>;
  }
}
