/// <reference types="@gasket/plugin-docs" />

/* eslint no-sync: 0 */
import path from 'path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const write = fs.promises.writeFile;
const { name, version, description } = require('../package.json');
/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    async docsGenerate(gasket, docsConfigSet) {
      if (gasket.config?.docs?.graphs === false) return;
      const { docsRoot } = docsConfigSet;
      const targetRoot = path.join(docsRoot, 'generated-docs');
      const target = path.join(targetRoot, 'lifecycle-graphs.md');
      const cmds = new Set();

      let graph = 'graph LR;\n';

      docsConfigSet.lifecycles.forEach((lifecycle) => {
        const nodeName = lifecycle.deprecated
          ? `${lifecycle.name}["${lifecycle.name} (deprecated)"]`
          : lifecycle.name;

        const from =
          lifecycle.parent ||
          lifecycle.after ||
          lifecycle.command ||
          lifecycle.from;

        let styling = (i) => i;

        if (from === lifecycle.command) {
          styling = (i) => {
            cmds.add(i);
            return `${from}-cmd(${from})`;
          };
        }
        const arrow = lifecycle.method ? `-- ${lifecycle.method} -->` : '-->';

        if (nodeName !== from) {
          graph += `${styling(from)} ${arrow} ${nodeName};\n`;
        }
      });

      graph = graph.replace(/@/g, '');

      const commandStyles = Array.from(cmds)
        .map((c) => `style ${c}-cmd fill: red;`)
        .join('\n');

      const content = '```mermaid\n' + graph + commandStyles + '\n```';

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

export default plugin;
