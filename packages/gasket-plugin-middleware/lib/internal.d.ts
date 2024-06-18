import { Gasket } from '@gasket/core';
import type { Application as ExpressApp } from 'express';
import type { FastifyInstance as FastifyApp } from 'fastify';

export function applyCookieParser(
  app: ExpressApp | FastifyApp,
  middlewarePattern: RegExp
): void;

export function applyCompression(
  app: ExpressApp | FastifyApp,
  compressionConfig: boolean
): void;

export function executeMiddlewareLifecycle(
  gasket: Gasket,
  app: ExpressApp | FastifyApp,
  middlewarePattern: RegExp
): void;
