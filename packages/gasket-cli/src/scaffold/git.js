const run = require('../run-shell-command');

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
    await run('git', ['init'], { cwd: this.cwd });
  }

  /**
   * Add all files
   *
   * @returns {Promise} promise
   */
  async add() {
    await run('git', ['add', '.'], { cwd: this.cwd });
  }

  /**
   * Create a commit
   *
   * @param {string} message - Commit message
   * @returns {Promise} promise
   */
  async commit(message) {
    await run('git', ['commit', '-m', message], { cwd: this.cwd });
  }
};
