const semver = require('semver');

const reName = /^(@?[\w/-]+)@?(.*)/;

/**
 * Makes a function to look up package dependencies the current create context
 *
 * @param {CreateContext} context - Create context
 * @returns {function(string): object} gatherDevDeps
 */
function makeGatherDevDeps(context) {
  const { pkgManager } = context;

  /**
   * Looks up the latest version of specific package if not set, and gets info
   * on its peerDependencies. These, along with the original package w/ version
   * will be returned, which can then be used to add to the apps devDependencies.
   *
   * @param {string} rawName - Name of package with option version
   * @returns {Promise<{}>} dependencies
   */
  return async function gatherDevDeps(rawName) {
    const [, parsedName, parsedVersion] = reName.exec(rawName);

    let version = parsedVersion ? semver.minVersion(parsedVersion) : null;
    if (!version) {
      version = (await pkgManager.info([parsedName, 'version'])).data;
    }

    const full = `${parsedName}@${version.trim()}`;
    const peerDeps = (await pkgManager.info([full, 'peerDependencies'])).data;

    return {
      [parsedName]: parsedVersion || `^${version}`,
      ...(peerDeps || {})
    };
  };
}

/**
 * Makes a function to generate a package script string under the current create context
 *
 * @param {CreateContext} context - Create context
 * @returns {function(script): string} runScriptStr
 */
function makeRunScriptStr(context) {
  const { packageManager } = context;
  const runCmd = packageManager === 'npm' ? 'npm run' : packageManager;

  /**
   * Accepts a script name and adds `npm run` or `yarn`.
   * If extra flags are needed, use the extra `--` option following npm format,
   * which will be removed when the packageManager is yarn.
   *
   * @see: https://docs.npmjs.com/cli/run-script
   *
   * @param {string} script - Name of script to run
   * @returns {string} modifed script
   */
  return function runScriptStr(script) {
    let str = [runCmd, script].join(' ');
    if (runCmd === 'yarn') {
      str = str.replace('-- --', '--');
    }
    return str;
  };
}

/**
 * Makes a function to run scripts safely under the current create context
 *
 * @param {CreateContext} context - Create context
 * @param {function} runScript - Script runner util
 * @returns {function} safeRunScript
 */
function makeSafeRunScript(context, runScript) {
  const { pkg, warnings } = context;

  /**
   * Runs lint scripts safely by catching errors showing warnings in the create report.
   * We do not want to fail a create for these, because lint configurations
   * are fragile in nature due to combination of style choices and generated
   * content.
   *
   * @param {string} name - package.json script to run
   * @returns {Promise<void>} promise
   */
  return async function safeRunScript(name) {
    if (pkg.has('scripts', name)) {
      try {
        await runScript(name);
      } catch (e) {
        warnings.push(`Errors encountered running script: '${name}'`);
      }
    }
  };
}

module.exports = {
  makeGatherDevDeps,
  makeRunScriptStr,
  makeSafeRunScript
};
