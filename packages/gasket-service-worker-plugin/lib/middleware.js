const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

const nonNextRoute = /^(?!\/_next\/)/;
let __script;

/**
 * Loads template file once with substitutions from config
 *
 * @param {Object} config - ServiceWorker config from gasket.config
 * @returns {Promise<string>} template
 */
async function loadTemplate(config) {
  if (!__script) {
    const { url, scope } = config;
    const template = require.resolve('./sw-register.template.js');

    __script = await readFile(template, 'utf8');
    __script = __script.replace('{URL}', url);
    __script = __script.replace('{SCOPE}', scope);
  }
  return __script;
}

/**
 * Middleware lifecycle to return middleware layer
 *
 * @param {Gasket} gasket - Gasket
 * @returns {Function} middleware
 */
module.exports = function middleware(gasket) {
  const { serviceWorker } = gasket.config;

  /**
   * Middleware layer to attach the service worker registration script to req
   *
   * @param {Request} req - Request
   * @param {Response} res - Response
   * @param {Function} next - Callback
   * @returns {Promise} promise
   */
  async function layer(req, res, next) {
    if (nonNextRoute.test(req.path)) {
      const content = await loadTemplate(serviceWorker);

      req.swRegisterScript = `<script>${content}</script>`;
    }
    next();
  }

  return layer;
};
