const { applyConfigOverrides } = require('./config');
const runShellCommand = require('./run-shell-command');
const PackageManager = require('./package-manager');
const warnIfOutdated = require('./warn-if-outdated');
const getPackageLatestVersion = require('./get-package-latest-version');

module.exports = {
  applyConfigOverrides,
  runShellCommand,
  PackageManager,
  warnIfOutdated,
  getPackageLatestVersion
};
