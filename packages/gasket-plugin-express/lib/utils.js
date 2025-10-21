import express from 'express';
import http2Express from 'http2-express';
import cookieParser from 'cookie-parser';

let instance = null;

/**
 * Get the Express instance.
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @returns {import('express').Express} - Express instance
 */
export function getAppInstance(gasket) {
  if (!instance) {
    const { http2 } = gasket.config;
    instance = http2 ? http2Express(express) : express();
    instance.use(cookieParser());
  }

  return instance;
}

/**
 * Clear the Express instance for testing purposes.
 */
export function testClearAppInstance() {
  instance = null;
}
