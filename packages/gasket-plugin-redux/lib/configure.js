const path = require('path');
const fs = require('fs');

/**
 * Fixup makeStore path to be absolute, allowing relative paths in gasket.config
 * @type {import('@gasket/core').HookHandler<'configure'>}
 */
module.exports = function configure(gasket, baseConfig) {
  const { root, redux: reduxConfig = {} } = baseConfig;

  gasket.logger.warn(
    `DEPRECATED \`@gasket/plugin-redux\` will not be support in future major release.`
  );

  let makeStorePath = reduxConfig.makeStore;
  if (makeStorePath) {
    makeStorePath = path.resolve(baseConfig.root, reduxConfig.makeStore);
  } else {
    const possible = [
      path.resolve(root, 'redux', 'store.js'),
      path.resolve(root, 'store.js')
    ];
    // eslint-disable-next-line no-sync
    makeStorePath = possible.find((p) => fs.existsSync(p));
  }

  if (makeStorePath) {
    reduxConfig.makeStore = makeStorePath;
    // This allows packages (not in app) to reference the store file
    // eslint-disable-next-line no-process-env
    process.env.GASKET_MAKE_STORE_FILE = makeStorePath;
  }

  return {
    ...baseConfig,
    redux: reduxConfig
  };
};
