/**
 * Sets swagger plugin prop to true and adds swagger config to gasket.config
 *
 * @param {object} gasket - Gasket API
 * @param {CreateContext} context - Create context
 *
 */
module.exports = function create(gasket, context) {
  context.hasSwaggerPlugin = true;
  context.gasketConfig.add('swagger', {
    jsdoc: {
      definition: {
        info: {
          title: context.appName,
          version: '1.0.0'
        }
      },
      apis: ['./routes/*']
    }
  });
};
