/* eslint-disable no-console, no-sync */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const packagesDir = path.join(projectRoot, 'packages');
const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true });

const pluginDirs = packageDirs
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-plugin-'))
  .map(dirent => path.join(packagesDir, dirent.name));

const presetDirs = packageDirs
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('gasket-preset-'))
  .map(dirent => path.join(packagesDir, dirent.name));

module.exports = {
  plugins: {
    presets: presetDirs,
    add: pluginDirs
  }
};
