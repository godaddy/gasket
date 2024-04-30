/// <reference types="@gasket/plugin-start" />
/// <reference types="@gasket/plugin-log" />

const { filterSensitiveCookies } = require('./cookies');

/** @type {import('@gasket/engine').HookHandler<'preboot'>} */
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
    apm.start({
      ...config.elasticAPM
    });
    logger.notice(
      'DEPRECATED started Elastic APM agent late. Use `--require elastic-apm-node/start`'
    );
  }

  apm.addFilter(filterSensitiveCookies(config));

  gasket.apm = apm;
};
