const { loadRegisterScript } = require('./utils/utils');

/** @type {import('@gasket/core').ActionHandler<'getSWRegisterScript'>} */
async function getSWRegisterScript(gasket) {
  const { serviceWorker: config } = gasket.config;
  const content = await loadRegisterScript(config);
  // eslint-disable-next-line require-atomic-updates
  return `<script>${content}</script>`;
}

module.exports = {
  getSWRegisterScript
};
