/**
 * Utility for plugins to add files and templates for generating
 *
 * @type {Files}
 */
module.exports = class Files {
  constructor() {
    this.globSets = [];
  }

  /**
   * Return array of globs
   *
   * @deprecated
   * @returns {string[]} `globby` compatible patterns
   */
  get globs() {
    return this.globSets.reduce((acc, cur) => [...acc, ...cur.globs], []);
  }

  /**
   * Adds the specified `globby` compatible patterns, `globs`,
   * into the set of all sources for this set of files.
   * @param {string[]} globs - `globby` compatible patterns
   * @param {Object} source - Plugin to blame if conflicts arise from this operation.
   */
  add({ globs, source }) {
    this.globSets.push({ globs, source });
  }
};
