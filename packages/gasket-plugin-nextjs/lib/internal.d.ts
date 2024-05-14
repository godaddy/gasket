import { Gasket } from '@gasket/engine';
import type NextServer from 'next/dist/next-server/server/next-server';
import type { Application } from 'express';
import type { Fastify } from 'fastify';

/**
 * Small helper function that creates nextjs app from the gasket configuration.
 */
export async function setupNextApp(gasket: Gasket): NextServer;

/**
 * Sets up the next.js request handler to be called after all other middleware
 */
export function setupNextServer(
  nextServer: NextServer,
  serverApp: Application | Fastify,
  gasket: Gasket
): void;
