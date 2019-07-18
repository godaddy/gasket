/**
 * Utility for plugins to add files and templates for generating
 *
 * @type {Files}
 */
module.exports = class Files {
  constructor() {
    this.globs = [];
  }

  /**
   * Adds the specified `globby` compatible patterns, `globs`,
   * into the set of all sources for this set of files.
   * @param {string[]} globs `globby` compatible patterns
   */
  add({ globs, source }) { // eslint-disable-line no-unused-vars
    this.globs.push(...globs);
  }
};
