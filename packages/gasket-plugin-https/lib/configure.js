/** @type {import('@gasket/core').HookHandler<'configure'>} */
module.exports = function configure(gasket, config) {
  const { root } = config;

  function setRoot(serverConfig) {
    if (!serverConfig) return;
    if (serverConfig.root) return;

    if (Array.isArray(serverConfig)) {
      serverConfig.forEach(item => {
        item.root = root;
      });
    } else {
      serverConfig.root = root;
    }
  }

  setRoot(config.https);
  setRoot(config.http2);

  return config;
};
