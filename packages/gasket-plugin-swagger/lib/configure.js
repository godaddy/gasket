/**
 * Configure swagger plugin defaults
 *
 * @param {object} gasket - Gasket API
 * @param {object} baseConfig - Config object to manipulate
 * @returns {object} config
 */
module.exports = function configure(gasket, baseConfig) {
  const { swagger = {} } = baseConfig;

  return {
    ...baseConfig,
    swagger: {
      ...swagger,
      definitionFile: swagger.definitionFile || 'swagger.json',
      apiDocsRoute: swagger.apiDocsRoute || '/api-docs'
    }
  };
};
