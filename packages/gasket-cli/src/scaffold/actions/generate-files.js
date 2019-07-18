const { promisify } = require('util');
const Handlebars = require('handlebars');
const pump = promisify(require('pump'));
const map = require('map-stream');
const path = require('path');
const action = require('../action-wrapper');

/**
 * Generate the app files and templates using context
 *
 * @param {CreateContext} context - Create context
 * @param {Spinner} spinner - Spinner
 * @returns {Promise} promise
 */
async function generateFiles(context, spinner) {
  const { dest, files, generatedFiles } = context;

  if (!files.globs.length) {
    // vfs.src cannot handle an empty array
    return;
  }

  const handlebars = Handlebars.create();
  handlebars.registerHelper('json', JSON.stringify);
  handlebars.registerHelper('jspretty', (data) => {
    return JSON.stringify(data).replace(/"/g, '\'');
  });

  const failMsg = [];

  /**
   * Attempts to template the `.contents` of the file provided.
   *
   * @param  {Vinyl} file - Virtual file descriptor.
   * @param  {Function} next - Continue file processing.
   * @returns {undefined} Nothing of significance.
   * @private
   */
  function templateFile(file, next) {
    if (file.isDirectory()) return next(null, file);
    if (file.base === 'package.json') return next();

    // Set the "source" property to the unmodified contents.
    file.source = file.contents + '';

    // Strip `.template` from any files (e.g. .npmrc.template)
    if (file.extname === '.template') {
      file.extname = '';
    }

    const targetPath = `${file.path.replace(file.base + path.sep, '')}`;

    try {
      const template = handlebars.compile(file.source);
      file.contents = Buffer.from(template(context));
    } catch (err) {
      failMsg.push(`Error templating ${targetPath}: ${err.message}`);
    }

    generatedFiles.add(targetPath);
    next(null, file);
  }

  // Now template the files as they are moved into place.

  const vfs = require('vinyl-fs');
  await pump(
    vfs.src(files.globs),
    map(templateFile),
    vfs.dest(dest)
  );

  context.warnings.push(...failMsg);
  if (failMsg.length) spinner.warn();
}

module.exports = action('Generate app contents', generateFiles);
