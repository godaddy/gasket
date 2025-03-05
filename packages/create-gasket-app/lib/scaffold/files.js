/**
 * Utility for plugins to add files and templates for generating
 * @type {import('../index').Files}
 */
export class Files {
  constructor() {
    /**
     * Array of glob sets, each containing an array of globs and a source object.
     * @type {Array<{globs: string[], source: object}>}
     */
    this.globSets = [];
  }

  /**
   * Return array of globs
   * @deprecated
   * @returns {string[]} `globby` compatible patterns
   */
  get globs() {
    return this.globSets.reduce((acc, cur) => [...acc, ...cur.globs], []);
  }

  /**
   * Adds the specified `globby` compatible patterns, `globs`,
   * into the set of all sources for this set of files.
   * @param {object} params - Object containing `globs` and `source`
   * @param {string[]} params.globs - `globby` compatible patterns
   * @param {object} params.source - Plugin to blame if conflicts arise from this operation.
   */
  add({ globs, source }) {
    this.globSets.push({ globs, source });
  }
}
