const path = require('path');
const { writeFile } = require('fs').promises;
const swaggerJSDoc = require('swagger-jsdoc');

const isYaml = /\.ya?ml$/;

/**
 * Builds the swagger spec from JSDocs if configured.
 *
 * @param {object} gasket - Gasket API
 * @async
 */
module.exports = async function build(gasket) {
  const { swagger, root } = gasket.config;
  const { jsdoc, definitionFile } = swagger;

  if (jsdoc) {
    const target = path.join(root, definitionFile);
    const swaggerSpec = swaggerJSDoc(jsdoc);

    if (!swaggerSpec) {
      gasket.logger.warning(
        `No JSDocs for Swagger were found in files (${jsdoc.apis}). Definition file not generated...`
      );
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
