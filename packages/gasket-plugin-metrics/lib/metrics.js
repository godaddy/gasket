/// <reference types="@gasket/plugin-metadata" />
/// <reference types="@gasket/plugin-command" />

const os = require('os');
const Git = require('git-shizzle');
const gitUrlParse = require('git-url-parse');
const debug = require('diagnostics')('gasket:cli:metrics');

class Metrics {
  /**
   * Instantiate metrics object tracker
   * @param {import('@gasket/engine').Gasket} gasket Gasket API
   */
  constructor(gasket) {
    const { command, config, metadata } = gasket;
    this.gitshizzle = new Git(config.root);
    this.config = config;
    this.cmd = command;
    // @ts-ignore
    // TEMP: ignoring as a temporary workaround until plugin-command is updated
    this.record = command.flags.record;
    this.metadata = metadata;
  }

  /**
   * Helper function to Promisify the `git` CLI calls.
   * @param {string} method Name of the method to call.
   * @param {string} arg The argument for the method.
   * @returns {Promise} Result.
   * @public
   */
  git(method, arg) {
    return new Promise((resolve) => {
      if (typeof this.gitshizzle[method] !== 'function') return resolve();

      this.gitshizzle[method](arg, function gitdata(err, output) {
        if (err) return resolve(void 0);

        resolve(output.trim());
      });
    });
  }

  /**
   * Collect helpful debugging metrics.
   * @returns {Promise} The collected metrics.
   * @public
   */
  async collect() {
    const [remote, branch] = await Promise.all([
      this.git('config', '--get remote.origin.url'),
      this.git('revParse', '--abbrev-ref HEAD')
    ]);

    const packagejson = this.metadata.app.package;

    const config = this.config;
    const dependencies = packagejson.dependencies || {};

    const gasket = Object.keys(dependencies)
      .filter((name) => {
        return name.startsWith('@gasket');
      })
      .reduce((memo, name) => {
        memo[name] = dependencies[name];
        return memo;
      }, {});

    return {
      name: packagejson.name,
      version: packagejson.version,
      gasket,
      deps: Object.keys(gasket),

      repository: remote && gitUrlParse(remote).toString('https'),
      branch: branch,

      config: Object.keys(config),

      system: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch()
      },

      env: config.env,
      argv: process.argv.slice(2),

      time: Date.now(),
      cmd: this.cmd.id
    };
  }

  /**
   * Generate report data
   * @returns {Promise} Resolution of the reporting process.
   * @public
   */
  async report() {
    if (!this.record) {
      return;
    }

    const body = await this.collect();
    debug('metrics', body);

    return body;
  }
}

// Expose the collection class.
module.exports = Metrics;
