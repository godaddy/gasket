/**
 * Utility to add content to gitignore
 *
 * @type {Gitignore}
 */
module.exports = class Gitignore {
  constructor() {
    this._content = {
      dependencies: new Set(['node_modules']),
      testing: new Set(['coverage', 'reports']),
      production: new Set(['dist', 'build', '.next']),
      misc: new Set(['.env', '.idea', '*.iml', '*.log', '*.bak', '.DS_Store']),
      special: new Set(['app.config.local.js*', 'gasket.config.local.js*', '.docs'])
    };
  }

  add(name, category = '') {
    if (Array.isArray(name)) {
      name.forEach(n => this.add(n, category));
    } else {
      this._content[category] ?
        this._content[category].add(name) :
        this._content[category] = new Set([name]);
    }
  }
};
