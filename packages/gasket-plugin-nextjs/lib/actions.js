const { createConfig } = require('./utils/config');
const nextRoute = require('./utils/next-route');

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  return {
    getNextConfig(nextConfig) {
      return async function setupNextConfig(phase, { defaultConfig }) {
        let baseConfig;
        if (nextConfig instanceof Function) {
          baseConfig = await nextConfig(phase, { defaultConfig });
        } else {
          baseConfig = nextConfig ?? {};
        }
        return createConfig(gasket, phase === 'phase-production-build', baseConfig);
      };
    },
    async getNextRoute(req) {
      return await nextRoute(gasket, req);
    }
  };
};
