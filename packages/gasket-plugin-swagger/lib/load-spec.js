const path = require('path');
const { readFile, access } = require('fs').promises;
const fs = require('fs');

const isYaml = /\.ya?ml$/;
let __swaggerSpec;

/**
 * Load the the Swagger spec, only once.
 *
 * @param {string} root - App root
 * @param {string} definitionFile - Path to file relative to root
 * @param {*} logger - gasket logger
 * @returns {Promise<object>} spec
 */
module.exports = async function loadSwaggerSpec(root, definitionFile, logger) {
  if (!__swaggerSpec) {
    const target = path.join(root, definitionFile);

    try {
      await access(target, fs.constants.F_OK);
      if (isYaml.test(definitionFile)) {
        const content = await readFile(target, 'utf8');
        __swaggerSpec = require('js-yaml').safeLoad(content);
      } else {
        __swaggerSpec = require(target);
      }
    } catch (err) {
      logger.error(`Missing ${definitionFile} file...`);
    }
  }
  return __swaggerSpec;
};
