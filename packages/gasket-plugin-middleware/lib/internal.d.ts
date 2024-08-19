import { Gasket } from '@gasket/core';
import type { Application as ExpressApp } from 'express';
import type { FastifyInstance as FastifyApp } from 'fastify';
import type { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2';

export function applyCookieParser(
  app: ExpressApp | FastifyApp<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>,
  middlewarePattern: RegExp
): void;

export function applyCompression(
  app: ExpressApp | FastifyAppFastifyApp<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>,
  compressionConfig: boolean
): void;

export function executeMiddlewareLifecycle(
  gasket: Gasket,
  app: ExpressApp | FastifyAppFastifyApp<Http2SecureServer, Http2ServerRequest, Http2ServerResponse>,
  middlewarePattern: RegExp
): void;
