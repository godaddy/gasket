const tryRequire = require('./try-require');
const { tryResolve } = require('./try-resolve');
const applyConfigOverrides = require('./apply-config-overrides');
const runShellCommand = require('./run-shell-command');
const PackageManager = require('./package-manager');
const requireWithInstall = require('./require-with-install');
const warnIfOutdated = require('./warn-if-outdated');

module.exports = {
  tryRequire,
  tryResolve,
  applyConfigOverrides,
  runShellCommand,
  PackageManager,
  requireWithInstall,
  warnIfOutdated
};
