const path = require('path');
const fs = require('fs').promises;

/**
 * If an error occurs during create, dump the context for debugging.
 * The error which cause the exit is also included in the log.
 *
 * @param {CreateContext} context - Create context
 * @param {Error} error - Exiting error
 * @returns {Promise<void>} promise
 */
module.exports = async function dumpErrorContext(context, error) {
  const { cwd } = context;

  try {
    const report = { exitError: error.stack, ...context };
    const fileName = 'gasket-create-error.log';

    const filePath = path.join(cwd, fileName);
    await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`Error log dumped to: ${filePath}`);
  } catch (err) {
    //
    // eat but print any errors during writing log file
    //
    console.error(`Error writing error log: ${err}`);
  }
};
