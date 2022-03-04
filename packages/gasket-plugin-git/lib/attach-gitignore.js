const path = require('path');
const { writeFile } = require('fs').promises;

/**
 * Utility to add contents to gitignore
 *
 * @type {Gitignore}
 */
class Gitignore {
  constructor() {
    this.contents = {};
  }

  add(name, category = '') {
    if (Array.isArray(name)) {
      name.forEach(n => this.add(n, category));
    } else {
      this.contents[category] ?
        this.contents[category].push(name) :
        this.contents[category] = [name];
    }
  }

  async writeFile({ dest, generatedFiles }) {
    const fileName = '.gitignore';
    const filePath = path.join(dest, fileName);
    let desiredContents = '';

    for (const category in this.contents) {
      if (this.contents[category].length) {
        category !== '' ? desiredContents += `# ${category}\n` : null;
        desiredContents += this.contents[category].join('\n');
        desiredContents += '\n\n';
      }
    }

    await writeFile(filePath, desiredContents, 'utf8');
    generatedFiles.add(fileName);
  }
}

module.exports = {
  timing: {
    first: true
  },
  handler: function attachGitignore(gasket) {
    const { context } = gasket;
    context.gitignore = new Gitignore();
  }
};
