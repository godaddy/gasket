import { getAppInstance } from './utils.js';

const actions = {
  /**
   * @deprecated
   * @param {import('@gasket/core').Gasket} gasket - Gasket instance
   * @returns {import('express').Express} - Express instance
   */
  getExpressApp(gasket) {
    gasket.logger.warn(
      `DEPRECATED \`getExpressApp\` action will not be support in future major release.`
    );
    return getAppInstance(gasket);
  }
};

export default actions;
