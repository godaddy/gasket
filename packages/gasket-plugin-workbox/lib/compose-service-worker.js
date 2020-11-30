const { generateSWString } = require('workbox-build');
const merge = require('deepmerge');

const reComments = /\/\*.*(\n.+)*\*\//g;

/**
 * Gathers Workbox config by executing the `workbox` lifecycle.
 * Generates service worker strings and appends to the service worker content.
 *
 * @param {Gasket} gasket - Gasket
 * @param {String} content - Service worker content
 * @param {Object} context - Service worker context
 * @returns {Promise<string>} content
 */
module.exports = async function composeServiceWorker(gasket, content, context) {
  const { exec, config, logger } = gasket;
  const { workbox } = config;

  const configs = (await exec('workbox', workbox.config, context)).filter(Boolean);
  const mergedConfig = merge.all([workbox.config, ...configs]);

  const build = await generateSWString(mergedConfig);
  //
  // strip comments from workbox script
  //
  const workboxContent = build.swString.replace(reComments, '');

  if (build.warnings && build.warnings.length) {
    logger.warning(build.warnings);
  }

  return content + workboxContent;
};
