const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const mkdirp = promisify(require('mkdirp'));
const rimraf = promisify(require('rimraf'));

/**
 * Copies configured files for a module to the target output dir and applies
 * any transforms.
 *
 * @param {ModuleDocsConfig} moduleDocsConfig -
 * @param {DocsConfigSet} docsConfigSet - Configurations for collating docs
 * @returns {Promise} promise
 * @private
 */
async function processDocConfig(moduleDocsConfig, docsConfigSet) {
  const { transforms: gTransforms = [] } = docsConfigSet;
  const { sourceRoot, targetRoot, files, transforms = [] } = moduleDocsConfig;

  const allTransforms = transforms.concat(gTransforms);

  await Promise.all(files.map(async filename => {
    const source = path.join(sourceRoot, filename);
    const target = path.join(targetRoot, filename);
    await mkdirp(path.dirname(target));

    //
    // Process all files which meet transform any tests
    // Currently on supports/expects utf8 text files
    //
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
    //
    // If file does not need transformed we just copy it
    //
    await copyFile(source, target);
  }));
}

/**
 * Collect and combine doc files in proper order.
 *
 * @param {DocsConfigSet} docsConfigSet - Configurations for collating docs
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

  await Promise.all(flattened.map(docsConfig => processDocConfig(docsConfig, docsConfigSet)));
}

module.exports = collateFiles;
module.exports.processModule = processDocConfig;
