import { default as diagnostics } from 'diagnostics';
const debug = diagnostics('gasket:cli:generate-files');
import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
const { dim } = chalk;
import { withSpinner } from '../with-spinner.js';
import { glob } from 'glob';

const flatten = (acc, values) => (acc || []).concat(values);
const reSep = /[/\\]+/;
const joinSep = pthArr => pthArr.join(path.sep);
const splitSep = pthStr => pthStr.split(reSep);

/**
 * Find all duplicate target files and reduce to single descriptor.
 * Keeps track of overrides.
 * Last in wins.
 * @type {import('../../internal.js').reduceDescriptors}
 */
function reduceDescriptors(descriptors) {
  const reduced = descriptors.reduce((acc, desc) => {
    const { target } = desc;
    if (acc.has(target)) {
      const prev = acc.get(target);
      if (prev.from !== desc.from) {
        debug(`Using "${target}" from ${desc.from} instead of ${prev.from}`);
        desc.overrides = prev.from;
      }
    }
    acc.set(target, desc);
    return acc;
  }, new Map());

  return Array.from(reduced.values());
}

/**
 * Assemble the description objects from glob results
 * @type {import('../../internal.js').assembleDescriptors}
 */
function assembleDescriptors(dest, from, pattern, srcPaths) {
  const output = joinSep(splitSep(dest));
  const baseParts = splitSep(path.resolve(pattern.replace(/[/\\]+\.?\*.*$/, '')));
  const base = joinSep(baseParts);
  return srcPaths.map((srcPath) => {
    const parts = splitSep(srcPath);
    const srcFile = joinSep(parts);
    const target = joinSep(parts.slice(baseParts.length)).replace('.template', '');
    return {
      pattern,
      base,
      srcFile,
      targetFile: joinSep([output, target]),
      target,
      from
    };
  });
}

/**
 * Build a list of descriptions of all files we want to generate
 * @type {import('../../internal.js').getDescriptors}
 */
async function getDescriptors(context) {
  const { dest, files } = context;
  const descriptors = (
    await Promise.all(files.globSets.map(async set => {
      const { globs, source } = set;
      const matches = await Promise.all(globs.map(async pattern => {
        pattern = splitSep(pattern).join('/');  // Glob uses / for all OS's
        const srcPaths = await glob(pattern, { nodir: true });
        return assembleDescriptors(dest, source.name, pattern, srcPaths);
      }));
      return matches.reduce(flatten);
    }))
  ).reduce(flatten);

  return reduceDescriptors(descriptors);
}

/**
 * Read file content, apply templating, then write out target file.
 * @type {import('../../internal.js').performGenerate}
 */
async function performGenerate(context, descriptors) {
  const { warnings, errors, generatedFiles } = context;
  let hasWarning = false;
  let hasError = false;

  const handlebars = Handlebars.create();
  handlebars.registerHelper('json', JSON.stringify);
  handlebars.registerHelper('jspretty', (data) => {
    return JSON.stringify(data).replace(/"/g, '\'');
  });
  handlebars.registerHelper('eq', (a, b) => a === b);
  handlebars.registerHelper('markdownCompile', (data) => {
    return handlebars.compile(data)(context);
  });

  debug('descriptors', JSON.stringify(descriptors, null, 2));

  await Promise.all(descriptors.map(async desc => {
    const targetDir = path.dirname(desc.targetFile);
    let content;

    try {
      const source = await fs.readFile(desc.srcFile, { encoding: 'utf8' });
      content = source;
      try {
        content = handlebars.compile(source)(context);
      } catch (compileErr) {
        hasWarning = true;
        warnings.push(`Error templating ${desc.targetFile}: ${compileErr.message}`);
      }
    } catch (readErr) {
      if (readErr.code === 'EISDIR') {
        // Skipping directory errors.
        // node-glob seems to incorrectly captures some directories on Windows
        hasWarning = true;
        warnings.push(`Directory matched as template file: ${desc.targetFile}`);
      } else {
        hasError = true;
        errors.push(`Error reading template ${desc.srcFile}: ${readErr.message}`);
      }
    }
    if (!content) return;

    try {
      await mkdirp(targetDir);
      try {
        await fs.writeFile(desc.targetFile, content, { encoding: 'utf8' });
        const message = desc.target + (desc.overrides ? dim(` – from ${desc.from}`) : '');
        generatedFiles.add(message);
      } catch (writeErr) {
        hasError = true;
        errors.push(`Error writing ${desc.targetFile}: ${writeErr.message}`);
      }
    } catch (err) {
      hasError = true;
      errors.push(`Error creating directory ${targetDir}: ${err.message}`);
    }
  }));

  return [hasWarning, hasError];
}

/**
 * Generate the app files and templates using context
 * @type {import('../../internal.js').generateFiles}
 */
async function generateFiles({ context, spinner }) {
  const { files } = context;

  if (!files.globSets.length) {
    return;
  }

  let descriptors = await getDescriptors(context);
  descriptors = reduceDescriptors(descriptors);
  const [hasWarnings, hasError] = await performGenerate(context, descriptors);

  if (hasWarnings) spinner.warn();
  if (hasError) spinner.fail();
}

export default withSpinner('Generate app contents', generateFiles);
// exported for unit testing
export const _getDescriptors = getDescriptors;
export const _assembleDescriptors = assembleDescriptors;
