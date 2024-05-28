module.exports = async function setupServer(gasket, type) {
  // const { config, logger } = gasket;
  // const serverConfig = config[type];
  // const {
  //   routes,
  //   excludedRoutesRegex,
  //   middlewareInclusionsRegex,
  //   compression: compressionConfig = true,
  //   trustProxy = false
  // } = serverConfig;

};

function setupExpress(gasket) {
  const express = require('express');
  const cookieParser = require('cookie-parser');
  const compression = require('compression');

  const { config, logger } = gasket;
  const {
    express: {
      routes,
      excludedRoutesRegex,
      middlewareInclusionsRegex,
      compression: compressionConfig = true,
      trustProxy = false
    } = {},
    http2
  } = config;

  const app = http2 ? require('http2-express-bridge')(express) : express();
  if (excludedRoutesRegex) {
    // eslint-disable-next-line no-console
    const warn = logger ? logger.warn : console.warn;
    warn(`DEPRECATED express config 'excludedRoutesRegex' - use 'middlewareInclusionRegex'`);
  }

  if (trustProxy) {
    app.set('trust proxy', trustProxy);
  }

}

function setupFastify(gasket) {
  const { config, logger } = gasket;
  const {
    fastify: {
      routes,
      excludedRoutesRegex,
      middlewareInclusionsRegex,
      compression: compressionConfig = true,
      trustProxy = false
    } = {},
    http2
  } = config;

  const app = require('fastify')({ logger, trustProxy, http2 });
}

// const gasketConfig = {
//   server: {
//     type: 'express',
//     routes,
//     excludedRoutesRegex,
//     middlewareInclusionsRegex,
//     compression: compressionConfig = true,
//     trustProxy = false,
//   } = {}
// };
