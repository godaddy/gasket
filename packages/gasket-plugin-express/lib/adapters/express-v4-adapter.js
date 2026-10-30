import express from 'express';
import http2Express from 'http2-express';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from './base-adapter.js';

/**
 * Adapter for Express v4.x
 */
export class ExpressV4Adapter extends ExpressAdapter {
  /**
   * Create an Express v4 instance.
   * @param {object} config - Express configuration
   * @param {boolean} [config.http2] - Enable HTTP/2 via http2-express
   * @returns {import('express').Express} - Configured Express v4 instance
   */
  createInstance(config) {
    const { http2 } = config;
    const app = http2 ? http2Express(express) : express();
    app.use(cookieParser());
    return app;
  }
}
