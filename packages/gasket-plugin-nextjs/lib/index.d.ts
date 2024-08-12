import type { IncomingMessage, ServerResponse } from 'http';
import type { NextConfig } from 'next/dist/next-server/server/config-shared';
import type NextServer from 'next/dist/next-server/server/next-server';
import type { Application } from 'express';
import type { Fastify } from 'fastify';
import type { Gasket } from '@gasket/core';
import type { CreateContext } from 'create-gasket-app';

export { NextConfig, NextServer };

export type NextConfigFunction = (phase: string, context: {
  defaultConfig: NextConfig,
  isServer: boolean
}) => Promise<NextConfig>;

declare module '@gasket/core' {

  export interface GasketActions {
    getNextConfig?: (config?: NextConfig | NextConfigFunction) => (phase: string, context?: { defaultConfig?: any }) => Promise<NextConfig>
    getNextRoute?: (req: IncomingMessage) => Promise<null | {
      page: string;
      regex: RegExp;
      routeKeys: Record<string, string>;
      namedRegex: RegExp;
    }>;
  }

  export interface GasketConfig {
    nextConfig?: Partial<NextConfig>;
    /** @deprecated Use `nextConfig` */
    next?: Partial<NextConfig>;
    /**
     * Allows users to set a path prefix for the application. Must be set at
     * build time.
     * @example
     * basePath: '/docs'
     * @todo This should be moved to gasket/engine for next major release
     */
    basePath?: string;
  }

  export interface HookExecTypes {
    nextConfig(config: NextConfig): MaybeAsync<NextConfig>;
    next(nextServer: NextServer): MaybeAsync<void>;
    nextExpress(params: {
      next: NextServer;
      express: Application;
    }): MaybeAsync<void>;
    nextPreHandling(context: {
      nextServer: NextServer,
      req: IncomingMessage,
      res: ServerResponse
    }): MaybeAsync<void>;
    nextFastify(params: {
      next: NextServer;
      fastify: Fastify;
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
    path?: string;
  }
}

declare module 'create-gasket-app' {
  export interface CreateContext {
    addSitemap?: boolean;
    nextServerType: 'appRouter' | 'pageRouter' | 'customServer';
    nextDevProxy: boolean;
    typescript: boolean;
    useRedux: boolean;
    useAppRouter: boolean;
  }
}

declare module '@gasket/plugin-nextjs' {
  export const name = '@gasket/plugin-nextjs';
  export const hooks = {};

  /** Gets the NextJS route matching the request */
  export async function getNextRoute(
    gasket: Gasket,
    req: IncomingMessage
  ): Promise<null | {
    page: string;
    regex: RegExp;
    routeKeys: Record<string, string>;
    namedRegex: RegExp;
  }> {
    return Promise.resolve(null);
  }

  /* Exported prompts */
  export async function promptAppRouter(
    context: CreateContext,
    prompt: (
      prompts: Array<Record<string, any>>
    ) => Promise<Record<string, any>>
  ): Promise<undefined>

  export async function promptNextServerType(
    context: CreateContext,
    prompt: (
      prompts: Array<Record<string, any>>
    ) => Promise<Record<string, any>>
  ): Promise<undefined>

  export async function promptNextDevProxy(
    context: CreateContext,
    prompt: (
      prompts: Array<Record<string, any>>
    ) => Promise<Record<string, any>>
  ): Promise<undefined>

  export async function promptSitemap(
    context: CreateContext,
    prompt: (
      prompts: Array<Record<string, any>>
    ) => Promise<Record<string, any>>
  ): Promise<undefined>
}
