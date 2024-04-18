/// <reference types="@gasket/cli" />
/// <reference types="@gasket/plugin-git" />

const { DEFAULT_CONFIG } = require('./utils/constants');

/**
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(_gasket, { gitignore }) {
  gitignore?.add(DEFAULT_CONFIG.outputDir, 'Documentation');
};
