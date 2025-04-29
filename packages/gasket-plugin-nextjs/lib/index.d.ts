import type { IncomingMessage, ServerResponse } from 'http';
import type { NextConfig } from 'next';
import type { NextServer } from 'next/dist/server/next';
import type { Application } from 'express';
import type { FastifyInstance } from 'fastify';
import type { Gasket, Plugin } from '@gasket/core';
import type { CreateContext, CreatePrompt } from 'create-gasket-app' with { 'resolution-mode': 'import' };

export { NextConfig, NextServer };

export type NextConfigFunction = (phase: string, context: {
  defaultConfig: NextConfig,
  isServer?: boolean
}) => Promise<NextConfig>;

declare module '@gasket/core' {
  import type { GasketRequest } from '@gasket/request' with { 'resolution-mode': 'import' };

  export interface GasketActions {
    getNextConfig?: (config?: NextConfig | NextConfigFunction) => (phase: string, context?: { defaultConfig?: NextConfig }) => Promise<NextConfig>
    getNextRoute?: (req: GasketRequest) => Promise<null | {
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
      fastify: FastifyInstance;
    }): MaybeAsync<void>;
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
    useAppRouter: boolean;
    reactIntlPkg: string;
  }
}

declare module '@gasket/plugin-nextjs' {
  /** Gets the NextJS route matching the request */
  export function getNextRoute(
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
  export function promptAppRouter(
    context: CreateContext,
    prompt: CreatePrompt
  ): Promise<undefined>

  export function promptNextServerType(
    context: CreateContext,
    prompt: CreatePrompt
  ): Promise<undefined>

  export function promptNextDevProxy(
    context: CreateContext,
    prompt: CreatePrompt
  ): Promise<undefined>

  export function promptSitemap(
    context: CreateContext,
    prompt: CreatePrompt
  ): Promise<undefined>
}

declare const plugin: Plugin;

export default plugin;
