const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const builder = require('next/dist/build').default;

const { createConfig } = require('./config');

/**
 * Checks if Next.js Telemetry is enabled. If so, it disables it.
 *
 * https://nextjs.org/telemetry#how-do-i-opt-out
 *
 * @param {object} logger gasket logger
 */
async function checkTelemetryStatus(logger) {
  const statusRegex = /(?<=Status: ).*./;
  const { stdout = '' } = await exec('npx next telemetry status');
  const telemetryStatus = stdout.match(statusRegex)[0] || '';

  if (telemetryStatus === 'Enabled') {
    const { stdout: disableCmdOutput = '' } = await exec('npx next telemetry disable');
    logger.info(`Next.js Telemetry: ${disableCmdOutput.match(statusRegex)[0]}`);
  }
}

/**
 * Build lifecycle to check telemetry, prevent local builds, and build next dist files.
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Promise} promise
 */
async function build(gasket) {
  const { command, logger } = gasket;
  await checkTelemetryStatus(logger);

  // Don't do a build, use dev server for local
  if ((command.id || command) === 'local') return;

  return await builder(path.resolve('.'), await createConfig(gasket, true));
}

module.exports = build;
