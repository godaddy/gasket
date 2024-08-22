const { createConfig } = require('./utils/config');
const nextRoute = require('./utils/next-route');

/** @type {import('@gasket/core').ActionHandler<'getNextConfig'>} */
function getNextConfig(gasket, nextConfig) {
  return async function setupNextConfig(phase, { defaultConfig }) {
    let baseConfig;
    if (nextConfig instanceof Function) {
      baseConfig = await nextConfig(phase, { defaultConfig });
    } else {
      baseConfig = nextConfig ?? {};
    }
    return createConfig(gasket, baseConfig);
  };
}

/** @type {import('@gasket/core').ActionHandler<'getNextRoute'>} */
async function getNextRoute(gasket, req) {
  return await nextRoute(gasket, req);
}

module.exports = {
  getNextConfig,
  getNextRoute
};
