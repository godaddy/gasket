/**
 * Class to add content to gitignore
 */
module.exports = class Gitignore {
  constructor() {
    /** @type {import('./internal').GitIgnoreContent} */
    this._content = {
      dependencies: new Set(['node_modules']),
      testing: new Set(['coverage', 'reports']),
      production: new Set(['dist', 'build', '.next']),
      misc: new Set(['.env', '.idea', '*.iml', '*.log', '*.bak', '.DS_Store']),
      special: new Set([
        'app.config.local.js*',
        'gasket.config.local.js*',
        '.docs'
      ])
    };
  }

  /**
   * Adds content to gitignore
   * @param {string | string[]} name - name of file or directory to add to
   * gitignore
   * @param {string} category - category of gitignore content
   */
  add(name, category = '') {
    if (Array.isArray(name)) {
      name.forEach((n) => this.add(n, category));
    } else {
      this._content[category]
        ? this._content[category].add(name)
        : (this._content[category] = new Set([name]));
    }
  }
};
