
import fs from 'fs';
import path from 'path';
import { makeGasket } from '@gasket/core';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import configPlugin from './plugins/config-plugin.js';
import siteDocsPlugin from './plugins/site-docs-plugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const projectRoot = path.resolve(__dirname, '..', '..');
const packagesDir = path.join(projectRoot, 'packages');
const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true });

const pluginDirs = await Promise.all(packageDirs
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-plugin-'))
  .map(async dirent => {
    const { name } = require(path.join(packagesDir, dirent.name, 'package.json'));
    const mod = await import(name);
    return mod.default || mod;
  }));

export default makeGasket({
  appRoot: projectRoot,
  docs: {
    graphs: false
  },
  plugins: [configPlugin, siteDocsPlugin].concat(pluginDirs)
});

