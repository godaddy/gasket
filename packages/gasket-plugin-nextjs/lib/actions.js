import { createConfig } from './utils/config.js';
import nextRoute from './utils/next-route.js';

/** @type {import('@gasket/core').ActionHandler<'getNextConfig'>} */
function getNextConfig(gasket, nextConfig) {
  return async function setupNextConfig(phase, { defaultConfig }) {
    await gasket.isReady;
    let baseConfig;
    if (nextConfig instanceof Function) {
      baseConfig = await nextConfig(phase, { defaultConfig });
    } else {
      baseConfig = nextConfig ?? {};
    }
    return await createConfig(gasket, baseConfig);
  };
}

/** @type {import('@gasket/core').ActionHandler<'getNextRoute'>} */
async function getNextRoute(gasket, req) {
  await gasket.isReady;
  return await nextRoute(gasket, req);
}

export { getNextConfig, getNextRoute };
