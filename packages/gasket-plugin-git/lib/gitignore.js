/**
 * Utility to add content to gitignore
 *
 * @type {Gitignore}
 */
module.exports = class Gitignore {
  constructor() {
    this.content = {
      dependencies: ['node_modules'],
      testing: ['coverage', 'reports'],
      production: ['dist', 'build', '.next'],
      misc: ['.env', '.idea', '*.iml', '*.log', '*.bak', '.DS_Store'],
      special: ['app.config.local.js*', 'gasket.config.local.js*', '.docs']
    };
  }

  add(name, category = '') {
    if (Array.isArray(name)) {
      name.forEach(n => this.add(n, category));
    } else {
      this.content[category] ?
        this.content[category].push(name) :
        this.content[category] = [name];
    }
  }
};
