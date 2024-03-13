const { bold } = require('chalk');
const action = require('../action-wrapper');
const asciiLogo = require('../../utils/logo');

/**
 * Logs a new line in the console
 * @private
 */
const newline = () => {
  console.log('');
};

/**
 * Converts a camelCase string to Space Case
 * @see: https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form?answertab=active#tab-top
 *
 * @param {string} str - camelCase string to fixup
 * @returns {string} result
 * @private
 */
const toSpaceCase = str => str.replace(/([A-Z])/g, ' $1')
  .replace(/^./, s => s.toUpperCase());

/**
 * Builds the report object from context
 *
 * @param {CreateContext} context - Create context
 * @returns {Object} report
 * @private
 */
function buildReport(context) {
  const {
    appName,
    dest,
    fullPresets,
    plugins,
    generatedFiles: generatedFilesSet,
    messages,
    warnings,
    errors,
    nextSteps
  } = context;

  const generatedFiles = Array.from(generatedFilesSet);
  generatedFiles.sort();

  return {
    appName,
    output: dest,
    presets: fullPresets,
    plugins,
    generatedFiles,
    messages,
    warnings,
    errors,
    nextSteps
  };
}

/**
 * Outputs create command details to the console

 * @param {CreateContext} context - Create context
 */
function printReport(context) {
  const report = buildReport(context);
  const { warnings, errors } = context;

  console.log(`✨Success!
  
Finished with ${warnings.length} warnings and ${errors.length} errors using
` + asciiLogo);

  Object.entries(report).forEach(([k, v]) => {
    if (!v || !v.length) return;
    newline();
    console.log(`${bold(toSpaceCase(k))}`);
    if (Array.isArray(v)) {
      v.map(o => console.log(`  ${o}`));
    } else {
      console.log(`  ${v}`);
    }
  });

  newline();
}

module.exports = action('Print report', printReport, { startSpinner: false });
