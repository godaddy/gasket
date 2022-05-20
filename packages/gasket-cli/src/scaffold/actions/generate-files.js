const debug = require('diagnostics')('gasket:cli:generate-files');
const fs = require('fs').promises;
const { promisify } = require('util');
const Handlebars = require('handlebars');
const path = require('path');
const mkdirp = require('mkdirp');
const { dim } = require('chalk');
const action = require('../action-wrapper');

const glob = promisify(require('glob'));

/**
 * Find all duplicate target files and reduce to single descriptor.
 * Keeps track of overrides.
 * Last in wins.
 *
 * @param {object[]} descriptors - Details about files to generate
 * @returns {object[]} descriptors
 */
function reduceDescriptors(descriptors) {
  const reduced = descriptors.reduce((acc, desc) => {
    const { target } = desc;
    if (acc.has(target)) {
      const prev = acc.get(target);
      if (prev.from !== desc.from) {
        debug(`Using "${ target }" from ${ desc.from } instead of ${ prev.from }`);
        desc.overrides = prev.from;
      }
    }
    acc.set(target, desc);
    return acc;
  }, new Map());

  return Array.from(reduced.values());
}

/**
 * Build a list of descriptions of all files we want to generate
 *
 * @param {CreateContext} context - Create context
 * @returns {object[]} descriptors
 */
async function getDescriptors(context) {
  const { dest, files } = context;
  const descriptors = (
    await Promise.all(files.globSets.map(async set => {
      const { globs, source } = set;
      const matches = await Promise.all(globs.map(async pattern => {
        const srcPaths = await glob(pattern, { nodir: true });
        const base = path.resolve(pattern.replace(/\/\.?\*.*/, ''));
        const targets = srcPaths.map(pth => pth.replace(base + path.sep, '').replace('.template', ''));
        return targets.map((target, idx) => {
          return {
            pattern,
            base,
            srcFile: srcPaths[idx],
            targetFile: path.join(dest, target),
            target,
            from: source.name
          };
        });
      }));
      return matches.flat();
    }))
  ).flat();

  return reduceDescriptors(descriptors);
}

/**
 * Read file content, apply templating, then write out target file.
 *
 * @param {CreateContext} context - Create context
 * @param {object[]} descriptors - Details about files to generate
 * @returns {boolean} hasWarnings
 */
async function performGenerate(context, descriptors) {
  const { warnings, generatedFiles } = context;
  let hasWarning = false;

  const handlebars = Handlebars.create();
  handlebars.registerHelper('json', JSON.stringify);
  handlebars.registerHelper('jspretty', (data) => {
    return JSON.stringify(data).replace(/"/g, '\'');
  });

  await Promise.all(descriptors.map(async desc => {
    const source = await fs.readFile(desc.srcFile, { encoding: 'utf8' });
    let content = source;
    try {
      content = handlebars.compile(source)(context);
    } catch (err) {
      hasWarning = true;
      warnings.push(`Error templating ${ desc.targetFile }: ${ err.message }`);
    }
    await mkdirp(path.dirname(desc.targetFile));
    await fs.writeFile(desc.targetFile, content, { encoding: 'utf8' });
    const message = desc.target + (desc.overrides ? dim(` – from ${ desc.from }`) : '');
    generatedFiles.add(message);
  }));

  return hasWarning;
}

/**
 * Generate the app files and templates using context
 *
 * @param {CreateContext} context - Create context
 * @param {Spinner} spinner - Spinner
 * @returns {Promise} promise
 */
async function generateFiles(context, spinner) {
  const { files } = context;

  if (!files.globSets.length) {
    return;
  }

  let descriptors = await getDescriptors(context);
  descriptors = reduceDescriptors(descriptors);
  const hasWarnings = await performGenerate(context, descriptors);

  if (hasWarnings) spinner.warn();
}

module.exports = action('Generate app contents', generateFiles);
// exported for unit testing
module.exports._getDescriptors = getDescriptors;
