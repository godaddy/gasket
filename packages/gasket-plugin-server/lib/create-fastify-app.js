module.exports = function createFastifyApp({ logger, trustProxy, http2 }) {
  const fastifyApp = require('fastify')({ logger, trustProxy, http2 });
  return fastifyApp;
};
