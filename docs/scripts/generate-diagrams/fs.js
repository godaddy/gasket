const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const rootDir = path.join(__dirname, '..', '..');

async function tryMkdir(path) {
  try {
    await mkdir(path);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

function imagePath(filePath) {
  return path.join(rootDir, 'images', 'lifecycle', filePath);
}

module.exports = {
  mkdir,
  tryMkdir,
  imagePath,
  writeFile,
  rootDir
};
