const path = require('path');
const fs = require('fs');

/**
 * Fixup makeStore path to be absolute, allowing relative paths in gasket.config
 *
 * @param {Object} gasket The gasket API.
 * @returns {Object} reduxConfig - updated gasket.config.redux object.
 */
module.exports.getReduxConfig = function (gasket) {
  const { logger, config } = gasket;
  const { redux: baseConfig = {} } = config;
  const fixupConfig = {};

  if (baseConfig.makeStore) {
    fixupConfig.makeStore = path.resolve(config.root, baseConfig.makeStore);
  } else {
    const storeFilePath = path.resolve(config.root, 'store.js');

    // eslint-disable-next-line no-sync
    if (fs.existsSync(storeFilePath)) {
      fixupConfig.makeStore = storeFilePath;
    }
  }

  return {
    ...baseConfig,
    ...fixupConfig,
    logger
  };
};
