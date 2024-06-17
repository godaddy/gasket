/// <reference types="@gasket/plugin-logger" />

const { filterSensitiveCookies } = require('./cookies');

// @ts-expect-error - TODO: will be cleaned up in the apm tune up ticket
// https://godaddy-corp.atlassian.net/browse/PFX-628
/** @type {import('@gasket/core').HookHandler<'preboot'>} */
module.exports = async function preboot(gasket) {
  const { config, logger, command } = gasket;

  if (command && command.id === 'local') return;

  /**
   * @type {import('elastic-apm-node')}
   * Note: Prefer app-level dependency in case of duplicates
   */
  const apm = require(require.resolve('elastic-apm-node', {
    paths: [config.root, __dirname]
  }));

  if (!apm.isStarted()) {
    logger.warn(
      'Elastic APM agent is not started. Use `--require ./setup.js`'
    );
  }

  apm.addFilter(filterSensitiveCookies(config));

  gasket.apm = apm;
};
