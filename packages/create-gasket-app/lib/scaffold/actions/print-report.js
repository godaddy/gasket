import pkg from 'chalk';
const { bold } = pkg;
import { withSpinner } from '../with-spinner.js';
import { logo } from '../../utils/index.js';

/**
 * Logs a new line in the console
 * @private
 */
const newline = () => {
  // eslint-disable-next-line no-console
  console.log('');
};

/**
 * Converts a camelCase string to Space Case
 * https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form?answertab=active#tab-top
 * @param {string} str - camelCase string to fixup
 * @returns {string} result
 * @private
 */
const toSpaceCase = str => str.replace(/([A-Z])/g, ' $1')
  .replace(/^./, s => s.toUpperCase());

/**
 * Builds the report object from context
 * @type {import('../../internal').buildReport}
 * @private
 */
function buildReport(context) {
  const {
    appName,
    dest,
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
    generatedFiles,
    messages,
    warnings,
    errors,
    nextSteps
  };
}

/**
 * Outputs create command details to the console
 * @type {import('../../internal').printReport}
 */
async function printReport({ context }) {
  const report = buildReport(context);
  const { warnings, errors } = context;

  // eslint-disable-next-line no-console
  console.log(`✨Success!

Finished with ${warnings.length} warnings and ${errors.length} errors using
` + logo);

  Object.entries(report).forEach(([k, v]) => {
    if (!v || !v.length) return;
    newline();
    // eslint-disable-next-line no-console
    console.log(`${bold(toSpaceCase(k))}`);
    if (Array.isArray(v)) {
      // eslint-disable-next-line no-console
      v.map(o => console.log(`  ${o}`));
    } else {
      // eslint-disable-next-line no-console
      console.log(`  ${v}`);
    }
  });

  newline();
}

export default withSpinner('Print report', printReport, { startSpinner: false });
