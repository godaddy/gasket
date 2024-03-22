/// <reference types="@gasket/cli" />

const { defaultConfig } = require('./configure');

/**
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(_gasket, { gitignore }) {
  gitignore?.add(defaultConfig.outputDir, 'Documentation');
};
