const tryRequire = require('./try-require');
const { tryResolve } = require('./try-resolve');
const applyConfigOverrides = require('./apply-config-overrides');
const applyEnvironmentOverrides = require('./apply-env-overrides');
const runShellCommand = require('./run-shell-command');
const PackageManager = require('./package-manager');
const requireWithInstall = require('./require-with-install');

module.exports = {
  tryRequire,
  tryResolve,
  applyConfigOverrides,
  applyEnvironmentOverrides,
  runShellCommand,
  PackageManager,
  requireWithInstall
};
