import { getAppInstance } from './utils.js';

const actions = {
  /**
   * @deprecated
   * @param {import('@gasket/core').Gasket} gasket - Gasket instance
   * @returns {import('fastify').FastifyInstance} - Fastify instance
   */
  getFastifyApp(gasket) {
    gasket.logger.warn(
      `DEPRECATED \`getFastifyApp\` action will not be support in future major release.`
    );
    return getAppInstance(gasket);
  }
};

export default actions;
