const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const isYaml = /\.ya?ml$/;
const { writeFile } = require('fs').promises;

/** @type {import('@gasket/plugin-swagger').buildSwaggerDefinition} */
module.exports = async function buildSwaggerDefinition(gasket, options) {
  const root = options?.root || gasket.config.root;
  const swagger = options?.swagger || gasket.config.swagger;
  const { jsdoc, definitionFile = 'swagger.json' } = swagger;

  if (jsdoc) {
    const target = path.join(root, definitionFile);
    const { version } = require(path.join(root, 'package.json'));
    jsdoc.definition.info.version = version;
    const swaggerSpec = swaggerJSDoc(jsdoc);

    if (!swaggerSpec) {
      gasket.logger.warn(`No JSDocs for Swagger were found in files (${jsdoc.apis}). Definition file not generated...`);
    } else {
      let content;
      if (isYaml.test(definitionFile)) {
        content = require('js-yaml').safeDump(swaggerSpec);
      } else {
        content = JSON.stringify(swaggerSpec, null, 2);
      }

      await writeFile(target, content, 'utf8');
      gasket.logger.info(`Wrote: ${definitionFile}`);
    }
  }
};
