// @ts-nocheck

import { createRequire } from 'module';
import { FastifyV4Adapter } from './fastify-v4-adapter.js';
import { FastifyV5Adapter } from './fastify-v5-adapter.js';

const require = createRequire(import.meta.url);

/**
 * Detect the installed Fastify version.
 * Reads the version from fastify/package.json in node_modules.
 * This works reliably with npm, pnpm, yarn, and bun.
 * @returns {string} - Version string (e.g., '5.2.1')
 */
export function detectFastifyVersion() {
  try {
    const fastifyModule = require('fastify/package.json');
    return fastifyModule.version;
  } catch (err) {
    throw new Error(
      'Could not detect Fastify version. Ensure fastify is installed.\n' +
      `Error: ${err.message}`
    );
  }
}

/**
 * Create the appropriate Fastify adapter based on the installed Fastify version.
 * Automatically detects the version from fastify/package.json.
 * @returns {import('./base-adapter.js').FastifyAdapter} - Adapter instance
 */
export function createFastifyAdapter() {
  const version = detectFastifyVersion();
  const majorVersion = parseInt(version.split('.')[0], 10);

  switch (majorVersion) {
    case 4:
      return new FastifyV4Adapter();
    case 5:
      return new FastifyV5Adapter();
    default:
      throw new Error(
        `Unsupported Fastify version: ${version}\n` +
        'Gasket supports Fastify v4 and v5. Please upgrade or downgrade Fastify, ' +
        'or open an issue at https://github.com/godaddy/gasket'
      );
  }
}
