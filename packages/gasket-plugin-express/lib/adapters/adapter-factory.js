import { createRequire } from 'module';
import { ExpressV4Adapter } from './express-v4-adapter.js';
import { ExpressV5Adapter } from './express-v5-adapter.js';

const require = createRequire(import.meta.url);

/**
 * Detect the installed Express version.
 * Reads the version from express/package.json in node_modules.
 * This works reliably with npm, pnpm, yarn, and bun.
 * @returns {string} - Version string (e.g., '5.1.0')
 */
export function detectExpressVersion() {
  try {
    const expressPackage = require('express/package.json');
    return expressPackage.version;
  } catch (err) {
    throw new Error(
      'Could not detect Express version. Ensure express is installed.\n' +
      `Error: ${err.message}`
    );
  }
}

/**
 * Create the appropriate Express adapter based on the Express version.
 * @param {string} [version] - Express version; detected from express/package.json by default
 * @returns {import('./base-adapter.js').ExpressAdapter} - Adapter instance
 */
export function createExpressAdapter(version = detectExpressVersion()) {
  const majorVersion = parseInt(version.split('.')[0], 10);

  switch (majorVersion) {
    case 4:
      return new ExpressV4Adapter();
    case 5:
      return new ExpressV5Adapter();
    default:
      throw new Error(
        `Unsupported Express version: ${version}\n` +
        'Gasket supports Express v4 and v5. Please upgrade or downgrade Express, ' +
        'or open an issue at https://github.com/godaddy/gasket'
      );
  }
}
