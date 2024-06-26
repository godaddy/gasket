/* eslint-disable no-process-env */
const runShellCommand = require('./run-shell-command');

/**
 * Wrapper class for executing commands for a given package manager
 */
class PackageManager {
  /** @param {import('./index').PackageManagerOptions} options -  Options */
  constructor({ packageManager = 'npm', dest }) {
    this.manager = packageManager;
    this.dest = dest;
  }

  /**
   * Executes the appropriate npm binary with the verbatim `argv` and
   * `spawnWith` options provided. Passes appropriate debug flag for
   * npm based on process.env.
   * @param {string[]} argv Precise CLI arguments to pass to `npm`.
   * @param {object} spawnWith Options for child_process.spawn.
   * @returns {Promise} promise
   * @public
   */
  static spawnNpm(argv, spawnWith) {
    // Remark: the npm binary is platform dependent. See:
    // https://stackoverflow.com/questions/43230346/error-spawn-npm-enoent/43285131
    const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    return runShellCommand(
      npmBin,
      argv,
      spawnWith,
      !!process.env.GASKET_DEBUG_NPM
    );
  }

  /**
   * Executes the appropriate npm binary with the verbatim `argv` and
   * `spawnWith` options provided. Passes appropriate debug flag for
   * npm based on process.env.
   * @param {string[]} argv Precise CLI arguments to pass to `npm`.
   * @param {object} spawnWith Options for child_process.spawn.
   * @returns {Promise} promise
   * @public
   */
  static spawnPnpm(argv, spawnWith) {
    // TODO: confirm pnpm binary name on windows
    const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

    return runShellCommand(
      pnpmBin,
      argv,
      spawnWith,
      !!process.env.GASKET_DEBUG_NPM
    );
  }

  /**
   * Executes the appropriate yarn binary with the verbatim `argv` and
   * `spawnWith` options provided. Passes appropriate debug flag for
   * npm based on process.env.
   * @param {string[]} argv Precise CLI arguments to pass to `npm`.
   * @param {object} spawnWith Options for child_process.spawn.
   * @returns {Promise} promise
   * @public
   */
  static spawnYarn(argv, spawnWith) {
    // Just like the `npm` binary, the `yarn` binary is different on windows
    // than it's on unix system.
    //
    // See: https://github.com/yarnpkg/yarn/tree/master/bin
    const yarnBin = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

    return runShellCommand(
      yarnBin,
      argv,
      spawnWith,
      !!process.env.GASKET_DEBUG_YARN
    );
  }

  /**
   * Executes npm in the application directory `this.dest`.
   * This installation can be run multiple times.
   * @param {string} cmd The command that needs to be executed.
   * @param {string[]} args Additional CLI arguments to pass to `npm`.
   * @returns {Promise} promise
   * @public
   */
  async exec(cmd, args = []) {
    const env = Object.assign({}, process.env);

    if (this.manager === 'npm') {
      // Given that we are spawning `npm` in a child process a number of
      // valid TTY options need to be disabled to get proper output
      //
      // Remark: should we make this the default in ./npm?
      const argv = [
        '--loglevel', 'info',
        '--spin', 'false',
        '--progress', 'false'
      ].concat(cmd, args);

      return await PackageManager.spawnNpm(argv, {
        cwd: this.dest,
        env
      });
    } else if (this.manager === 'pnpm') {
      const argv = [
        '--reporter', 'append-only'
      ].concat(cmd, args);

      return await PackageManager.spawnPnpm(argv, {
        cwd: this.dest,
        env
      });
    } else if (this.manager === 'yarn') {
      const argv = [cmd].concat(args);

      return await PackageManager.spawnYarn(argv, {
        cwd: this.dest,
        env
      });
    }

    return Promise.reject(
      new Error(`Package manager ${this.manager} is not supported by Gasket`)
    );
  }

  /**
   * Executes npm link in the application directory `this.dest`.
   * @param {string[]} packages Explicit `npm` packages to link locally.
   * @returns {Promise} promise
   * @public
   */
  async link(packages = []) {
    return this.exec('link', packages);
  }

  /**
   * Executes npm install in the application directory `this.dest`.
   * This installation can be run multiple times.
   * @param {string[]} args Additional CLI arguments to pass to `npm`.
   * @returns {Promise} promise
   * @public
   */
  async install(args = []) {
    // --legacy-peer-deps is not supported by pnpm
    if (this.manager === 'pnpm') {
      return this.exec('install', args);
    }

    // Installing with --legacy-peer-deps flag to accommodate npm7, specifically
    // requiring different versions of react
    return this.exec('install', [...args, '--legacy-peer-deps']);
  }

  /**
   * Executes yarn or npm info, and returns parsed JSON data results.
   * @param {string[]} args Additional CLI arguments to pass to `npm`.
   * @returns {Promise<object>} stdout and data
   * @public
   */
  async info(args = []) {
    const { stdout } = await this.exec('info', [...args, '--json']);
    // normalize stdout results of yarn and npm before parsing
    let normalized = this.manager.includes('npm') ? `{ "data": ${stdout} }` : stdout;
    normalized = stdout ? normalized : '{}';

    const { data } = JSON.parse(normalized);

    return {
      stdout,
      data
    };
  }
}

module.exports = PackageManager;
