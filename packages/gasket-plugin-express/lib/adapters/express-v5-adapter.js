import express from 'express';
import http2Express from 'http2-express';
import cookieParser from 'cookie-parser';
import { ExpressAdapter } from './base-adapter.js';

/**
 * Adapter for Express v5.x
 */
export class ExpressV5Adapter extends ExpressAdapter {
  /**
   * @param {typeof import('express')} [expressModule] - Express module to wrap; tests pass a specific major
   */
  constructor(expressModule = express) {
    super();
    this.express = expressModule;
  }

  /**
   * Create an Express v5 instance.
   * @param {object} config - Express configuration
   * @param {boolean} [config.http2] - Enable HTTP/2 via http2-express
   * @returns {import('express').Express} - Configured Express v5 instance
   */
  createInstance(config) {
    const { http2 } = config;
    const app = http2 ? http2Express(this.express) : this.express();
    app.use(cookieParser());
    return app;
  }
}
