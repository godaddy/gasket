
const mkDir = require('./mkdir');
const loadPreset = require('./load-preset');
const globalPrompts = require('./global-prompts');
const setupPkg = require('./setup-pkg');
const writePkg = require('./write-pkg');
const installModules = require('./install-modules');
const linkModules = require('./link-modules');
const writeGasketConfig = require('./write-gasket-config');
const gitInit = require('./git-init');
const loadPkgForDebug = require('./load-pkg-for-debug');
const promptHooks = require('./prompt-hooks');
const createHooks = require('./create-hooks');
const generateFiles = require('./generate-files');
const postCreateHooks = require('./post-create-hooks');
const applyPresetConfig = require('./apply-preset-config');
const printReport = require('./print-report');
const addDefaultPlugins = require('./add-default-plugins');

module.exports = {
  mkDir,
  loadPreset,
  globalPrompts,
  setupPkg,
  writePkg,
  installModules,
  linkModules,
  writeGasketConfig,
  gitInit,
  loadPkgForDebug,
  promptHooks,
  createHooks,
  postCreateHooks,
  generateFiles,
  applyPresetConfig,
  printReport,
  addDefaultPlugins
};
