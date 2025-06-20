import runShellCommand from './run-shell-command.js';

/**
 * Get the latest version of a package from npm
 * @type {import('./index.js').getPackageLatestVersion}
 */
export default async function getPackageLatestVersion(pkgName, options = {}) {
  const cmdResult = await runShellCommand('npm', ['view', pkgName, 'version'], options);
  return cmdResult.stdout.trim();
}
