import pkg from 'chalk';
const { bold } = pkg;
import { withSpinner } from '../with-spinner.js';
import { logo } from '../../utils/index.js';

const newline = () => {
  console.log('');
};

// https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form?answertab=active#tab-top
const toSpaceCase = str => str.replace(/([A-Z])/g, ' $1')
  .replace(/^./, s => s.toUpperCase());

/** @type {import('../../internal.d.ts').buildReport} */
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

/** @type {import('../../internal.d.ts').printReport} */
async function printReport({ context }) {
  const report = buildReport(context);
  const { warnings, errors } = context;

  console.log(`✨Success!

Finished with ${warnings.length} warnings and ${errors.length} errors using
` + logo);

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

export default withSpinner('Print report', printReport, { startSpinner: false });
