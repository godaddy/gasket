const Git = require('git-shizzle');
const path = require('path');
const os = require('os');
const fs = require('fs');
const gitUrlParse = require('git-url-parse');
const debug = require('diagnostics')('gasket:cli:metrics');

class Metrics {
  /**
   * Instantiate metrics object tracker
   * @param  {Object} config gasket config
   * @param  {Boolean} record whether or not to record the event
   * @param  {String} cmd what gasket command is being run
   */
  constructor(config = {}, record, cmd) {
    this.gitshizzle = new Git(config.root);
    this.config = config;
    this.record = record;
    this.cmd = cmd;
  }

  /**
   * Attempt to read the `package.json` that is in the root of the project.
   *
   * @returns {Promise} The parsed `package.json`
   * @public
   */
  json() {
    const location = path.join(this.config.root, 'package.json');

    return new Promise(function promised(resolve) {
      fs.readFile(location, 'utf-8', function read(err, data) {
        if (err) return resolve({});

        let parsed;

        try { parsed = JSON.parse(data); } catch (e) { return resolve({}); }

        resolve(parsed);
      });
    });
  }

  /**
   * Helper function to Promisify the `git` CLI calls.
   *
   * @param {String} method Name of the method to call.
   * @param {String} arg The argument for the method.
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
   *
   * @returns {Object} The collected metrics.
   * @public
   */
  async collect() {
    const [remote, branch, packagejson] = await Promise.all([
      this.git('config', '--get remote.origin.url'),
      this.git('revParse', '--abbrev-ref HEAD'),
      this.json()
    ]);

    const config = this.config;
    const dependencies = packagejson.dependencies || {};

    const gasket = Object.keys(dependencies).filter((name) => {
      return name.startsWith('@gasket');
    }).reduce((memo, name) => {
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
      cmd: this.cmd
    };
  }

  /**
   * Generate report data
   *
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

//
// Expose the collection class.
//
module.exports = Metrics;
