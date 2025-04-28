import type { IncomingMessage, ServerResponse } from 'http';
import type { NextConfig } from 'next';
import type { NextServer } from 'next/dist/server/next';
import type { Application } from 'express';
import type { FastifyInstance } from 'fastify';
import type { Gasket, Plugin } from '@gasket/core';
import type { CreateContext, CreatePrompt } from 'create-gasket-app';
import type { GasketRequest } from '@gasket/request';

export { NextConfig, NextServer };

export type NextConfigFunction = (phase: string, context: {
  defaultConfig: NextConfig,
  isServer?: boolean
}) => Promise<NextConfig>;

declare module '@gasket/core' {

  export interface GasketActions {
    getNextConfig?: (config?: NextConfig | NextConfigFunction) => (phase: string, context?: { defaultConfig?: NextConfig }) => Promise<NextConfig>
    getNextRoute?: (req: import('@gasket/request').GasketRequest) => Promise<null | {
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

declare module 'create-gasket-app' {
  export interface CreateContext {
    addSitemap?: boolean;
    nextServerType: 'appRouter' | 'pageRouter' | 'customServer';
    nextDevProxy: boolean;
    useAppRouter: boolean;
    reactIntlPkg: string;
  }
}

/** Gets the NextJS route matching the request */
export function getNextRoute(
  gasket: Gasket,
  req: import('@gasket/request').GasketRequest
): Promise<{
  page: string;
  regex: RegExp;
  routeKeys: Record<string, string>;
  namedRegex: RegExp;
} | null>;

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

/**
 * Small helper function that creates nextjs app from the gasket configuration.
 */
export function setupNextApp(gasket: Gasket): NextServer & {
  prepare(): Promise<void>;
  getRequestHandler(): (req, res) => void;
};

/**
 * Sets up the next.js request handler to be called after all other middleware
 */
export function setupNextHandling(
  nextServer: NextServer,
  serverApp: Application | FastifyInstance,
  gasket: Gasket
): void;

declare const plugin: Plugin;

export default plugin;

