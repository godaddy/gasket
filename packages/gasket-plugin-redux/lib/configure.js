const path = require('path');
const fs = require('fs');

/**
 * Fixup makeStore path to be absolute, allowing relative paths in gasket.config
 *
 * @param {object} gasket - The gasket API.
 * @param {object} baseConfig -
 * @returns {Object} reduxConfig - updated gasket.config.redux object.
 */
module.exports = function configureHook(gasket, baseConfig) {
  const { root, redux: reduxConfig = {} } = baseConfig;
  const fixupConfig = {};

  let makeStore = reduxConfig.makeStore;
  if (makeStore) {
    makeStore = path.resolve(baseConfig.root, reduxConfig.makeStore);
  } else {
    const possible = [
      path.resolve(root, 'redux', 'store.js'),
      path.resolve(root, 'store.js')
    ];
    // eslint-disable-next-line no-sync
    makeStore = possible.find(p => fs.existsSync(p));
  }

  if (makeStore) {
    reduxConfig.makeStore = makeStore;
    // This allows packages (not in app) to reference the store file
    // eslint-disable-next-line no-process-env
    process.env.GASKET_MAKE_STORE_FILE = fixupConfig.makeStore;
  }

  return {
    ...baseConfig,
    redux: reduxConfig
  };
};
