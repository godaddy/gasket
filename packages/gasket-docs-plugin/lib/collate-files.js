const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

/**
 *
 * @param {ModuleDocsConfig} moduleDocsConfig
 * @param {DocsConfigSet} docsConfigSet
 * @returns {Promise} promise
 * @private
 */
async function processModule(moduleDocsConfig, docsConfigSet) {
  const { transforms: gTransforms = [] } = docsConfigSet;
  const { sourceRoot, targetRoot, files, transforms = [] } = moduleDocsConfig;

  const allTransforms = gTransforms.concat(transforms);

  await Promise.all(files.map(async filename => {
    const source = path.join(sourceRoot, filename);
    const target = path.join(targetRoot, filename);
    await mkdirp(path.dirname(target));

    // Process all files which meet transform tests
    if (allTransforms.some(tx => tx.test.test(source))) {
      let content = await readFile(source, 'utf8');
      content = allTransforms.reduce((acc, tx) => {
        if (tx.test.test(source)) {
          return tx.handler(acc, { filename, docsConfig: moduleDocsConfig, docsConfigSet });
        }
        return content;
      }, content);
      return await writeFile(target, content);
    }
    await copyFile(source, target);

  }));
}

/**
 *
 * @param {DocsConfigSet} docsConfigSet
 * @returns {Promise} promise
 */
async function collateFiles(docsConfigSet) {
  const { docsRoot } = docsConfigSet;
  await mkdirp(docsRoot);
  await rimraf(path.join(docsRoot, '*'));

  // flatten the moduleDocsConfigs then generate
  const flattened = ['plugins', 'presets', 'modules'].reduce((acc, type) => {
    return acc.concat(docsConfigSet[type]);
  }, [docsConfigSet.app]);

  await Promise.all(flattened.map(moduleDocsConfig => processModule(moduleDocsConfig, docsConfigSet)));
}

module.exports = collateFiles;
module.exports.processModule = processModule;
