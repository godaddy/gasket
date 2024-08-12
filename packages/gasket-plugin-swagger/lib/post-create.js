const buildSwaggerDefinition = require('./build-swagger-definition');

module.exports = async function postCreateHook(gasket, createContext) {
  const root = createContext.dest;
  const { jsdoc } = createContext.gasketConfig.fields.swagger;
  const apis = jsdoc.apis.map(glob => {
    // Remove the '.' at the start of the string
    const relativePath = glob.startsWith('./') ? glob.slice(1) : glob;
    return `${root}${relativePath}`;
  });
  const swagger = {
    jsdoc: {
      ...jsdoc,
      apis
    }
  }
  await buildSwaggerDefinition(gasket, {root, swagger});
}
