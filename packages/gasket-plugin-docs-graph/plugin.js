/* eslint no-sync: 0 */
const path = require('path');
const fs = require('fs');
const write = require('util').promisify(fs.writeFile);

module.exports = {
  name: require('./package.json').name,
  hooks: {
    async docsGenerate(gasket, docsConfigSet) {
      const { docsRoot } = docsConfigSet;
      const targetRoot = path.join(docsRoot, 'generated-docs');
      const target = path.join(targetRoot, 'lifecycle-graphs.md');

      let graph = 'graph LR;\n';
      docsConfigSet.lifecycles.forEach(lifecycle => {
        const name = lifecycle.name;
        const from = lifecycle.parent || lifecycle.after || lifecycle.command || lifecycle.from;
        const arrow = lifecycle.method ? `-- ${lifecycle.method} -->` : '-->';
        if (name !== from) {
          graph += `${from} ${arrow} ${name};\n`;
        }
      });

      graph = graph.replace(/@/g, '');
      const content = '```mermaid\n' + graph + '```';

      if (!fs.existsSync(targetRoot)) {
        fs.mkdirSync(targetRoot);
      }

      await write(target, content);

      return {
        name: 'Lifecycle Flowchart',
        description: 'A flowchart detailing how lifecycles are interrelated.',
        link: '/lifecycle-graphs.md',
        targetRoot
      };
    }
  }
};
