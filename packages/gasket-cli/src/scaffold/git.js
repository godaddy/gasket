const { runShellCommand } = require('@gasket/utils');

/**
 * Wrapping class for running git commands
 *
 * @type {Git}
 */
module.exports = class Git {
  constructor(dest) {
    this.cwd = dest;
  }

  /**
   * Init a git repo
   *
   * @returns {Promise} promise
   */
  async init() {
    await runShellCommand('git', ['init'], { cwd: this.cwd });
  }

  /**
   * Add all files
   *
   * @returns {Promise} promise
   */
  async add() {
    await runShellCommand('git', ['add', '.'], { cwd: this.cwd });
  }

  /**
   * Create a commit
   *
   * @param {string} message - Commit message
   * @returns {Promise} promise
   */
  async commit(message) {
    await runShellCommand('git', ['commit', '-m', message], { cwd: this.cwd });
  }
};
