import type { Gasket } from '@gasket/core';
import type { NextServer } from 'next/dist/server/next';
import type { Application } from 'express';
import type { FastifyInstance } from 'fastify';

/**
 * Small helper function that creates nextjs app from the gasket configuration.
 */
export function setupNextApp(gasket: Gasket): NextServer;

/**
 * Sets up the next.js request handler to be called after all other middleware
 */
export function setupNextHandling(
  nextServer: NextServer,
  serverApp: Application | FastifyInstance,
  gasket: Gasket
): void;

