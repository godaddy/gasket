
const mkDir = require('./mkdir');
const loadPreset = require('./load-preset');
const cliVersion = require('./cli-version');
const globalPrompts = require('./global-prompts');
const setupPkg = require('./setup-pkg');
const writePkg = require('./write-pkg');
const installModules = require('./install-modules');
const linkModules = require('./link-modules');
const writeGasketConfig = require('./write-gasket-config');
const loadPkgForDebug = require('./load-pkg-for-debug');
const promptHooks = require('./prompt-hooks');
const createHooks = require('./create-hooks');
const generateFiles = require('./generate-files');
const postCreateHooks = require('./post-create-hooks');
const applyPresetConfig = require('./apply-preset-config');
const printReport = require('./print-report');

module.exports = {
  mkDir,
  loadPreset,
  cliVersion,
  globalPrompts,
  setupPkg,
  writePkg,
  installModules,
  linkModules,
  writeGasketConfig,
  loadPkgForDebug,
  promptHooks,
  createHooks,
  postCreateHooks,
  generateFiles,
  applyPresetConfig,
  printReport
};
