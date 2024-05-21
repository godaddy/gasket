module.exports = async function setupServer(gasket, type) {
  const { config, logger } = gasket;
  const serverConfig = config[type];
  const {
    routes,
    excludedRoutesRegex,
    middlewareInclusionsRegex,
    compression: compressionConfig = true,
    trustProxy = false
  } = serverConfig;


  if (excludedRoutesRegex) {
    // eslint-disable-next-line no-console
    const warn = logger ? logger.warn : console.warn;
    warn(`DEPRECATED ${type} config 'excludedRoutesRegex' - use 'middlewareInclusionRegex'`);
  }

  if (type === 'express' && trustProxy) {
    app.set('trust proxy', trustProxy);
  }
};


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
