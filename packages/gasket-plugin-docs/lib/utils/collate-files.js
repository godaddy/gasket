const { readFile, writeFile, copyFile, stat } = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const mkdirp = require('mkdirp');
// TODO: rimraf currently does not have native promise support
// https://github.com/isaacs/rimraf/pull/229
const rimraf = promisify(require('rimraf'));

/**
 * Checks if a path is a file.
 * @param {string} filePath - The path to check.
 * @returns {Promise<boolean>} - True if it's a file, false otherwise.
 */
async function isFile(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch (err) {
    console.error(`Error checking file type for: ${filePath}`, err);
    return false;
  }
}

/**
 * Copies configured files for a module to the target output dir and applies any
 * transforms.
 * @param {import('../internal').ModuleDocsConfig} moduleDocsConfig -
 * @param {import('../internal').DocsConfigSet} docsConfigSet - Configurations for
 * collating docs
 * @returns {Promise<void>} promise
 * @private
 */
async function processModule(moduleDocsConfig, docsConfigSet) {
  const { transforms: gTransforms = [] } = docsConfigSet;
  const { sourceRoot, targetRoot, files, transforms = [] } = moduleDocsConfig;

  const allTransforms = transforms.concat(gTransforms);

  await Promise.all(
    files.map(async (filename) => {
      const source = path.join(sourceRoot, filename);
      const target = path.join(targetRoot, filename);

      // Check if the source is a file
      const isSourceFile = await isFile(source);
      if (!isSourceFile) {
        console.warn(`Skipping non-file: ${source}`);
        return;
      }

      await mkdirp(path.dirname(target));

      // Process all files which meet transform tests (expects UTF-8 text files)
      if (allTransforms.some((tx) => tx.test.test(source))) {
        let content = await readFile(source, 'utf8');
        content = allTransforms.reduce((acc, tx) => {
          if (tx.test.test(source)) {
            return tx.handler(acc, {
              filename,
              docsConfig: moduleDocsConfig,
              docsConfigSet
            });
          }
          return acc;
        }, content);
        return await writeFile(target, content);
      }

      // If file does not need transformation, just copy it
      await copyFile(source, target);
    })
  );
}

/**
 * Collect and combine doc files in proper order.
 * @param {import('../internal').DocsConfigSet} docsConfigSet - Configurations for
 * collating docs
 * @returns {Promise<void>} promise
 */
async function collateFiles(docsConfigSet) {
  const { docsRoot } = docsConfigSet;
  await mkdirp(docsRoot);
  await rimraf(path.join(docsRoot, '*'));

  // Flatten the moduleDocsConfigs then generate
  const flattened = ['plugins', 'presets', 'modules'].reduce(
    (acc, type) => acc.concat(docsConfigSet[type]),
    [docsConfigSet.app]
  );

  await Promise.all(
    flattened.map((docsConfig) =>
      collateFiles.processModule(docsConfig, docsConfigSet)
    )
  );
}

collateFiles.processModule = processModule;

module.exports = collateFiles;
