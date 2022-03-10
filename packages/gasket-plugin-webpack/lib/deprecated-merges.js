/**
 * Deprecated merging behavior
 * TODO: Remove in next major release
 *
 * @param {Gasket} gasket - The Gasket API
 * @param {object} initConfig - Initial webpack config
 * @param {object} context - Additional context-specific information
 * @returns {object} mergedConfig
 */
module.exports = function deprecatedMerges(gasket, initConfig, context) {
  const { logger, execApplySync, config } = gasket;
  const WebpackChain = require('webpack-chain');
  const { smart: deprecatedSmartMerge } = require('webpack-merge');

  if ('webpack' in config) {
    logger.warning(`DEPRECATED \`webpack\` in Gasket config - Prefer \`webpackConfig\` lifecycle. See _http://x.co/2wbpckCnfg`);
  }

  const chain = new WebpackChain();
  execApplySync('webpackChain', (plugin, handler) => {
    const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycles';
    logger.warning(`DEPRECATED \`webpackChain\` lifecycle in ${ name } - Use \`webpackConfig\`. See _http://x.co/2wbpckCnfg`);
    return handler(chain, context);
  });

  const baseConfig = deprecatedSmartMerge(
    initConfig,
    chain.toConfig(),         // From webpackChain (partial)
    config.webpack || {}      // From gasket config file (partial)
  );

  const configPartials = execApplySync('webpack', (plugin, handler) => {
    const name = plugin ? plugin.name || 'unnamed plugin' : 'app lifecycles';
    logger.warning(`DEPRECATED \`webpack\` lifecycle in ${ name } - Use \`webpackConfig\`. See _http://x.co/2wbpckCnfg`);
    return handler(baseConfig, context);
  });

  return deprecatedSmartMerge(
    baseConfig,
    ...configPartials
  );
};
