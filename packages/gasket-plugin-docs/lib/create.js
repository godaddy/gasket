/// <reference types="create-gasket-app"/>
/// <reference types="@gasket/plugin-git" />

const { name, version } = require('../package.json');

const { DEFAULT_CONFIG } = require('./utils/constants');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, gasketConfig, gitignore }) {
  gitignore?.add(DEFAULT_CONFIG.outputDir, 'Documentation');
  gasketConfig.addPlugin('pluginDocs', name);
  pkg.add('dependencies', {
    [name]: `^${version}`
  });
};
