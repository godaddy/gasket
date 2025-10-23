import path from 'node:path';
import swaggerJSDoc from 'swagger-jsdoc';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const isYaml = /\.ya?ml$/;

/** @type {import('./index.d.ts').buildSwaggerDefinition} */
export default async function buildSwaggerDefinition(gasket, options) {
  const root = options?.root || gasket.config.root;
  const swagger = options?.swagger || gasket.config.swagger;
  const { jsdoc, definitionFile = 'swagger.json' } = swagger;

  if (jsdoc) {
    const target = path.join(root, definitionFile);
    const { version } = require(path.join(root, 'package.json'));
    jsdoc.definition.info.version = version;
    const swaggerSpec = swaggerJSDoc(jsdoc);

    if (!swaggerSpec) {
      gasket.logger.warn(
        `No JSDocs for Swagger were found in files (${jsdoc.apis}). Definition file not generated...`
      );
    } else {
      let content;
      if (isYaml.test(definitionFile)) {
        const yaml = await import('js-yaml');
        content = yaml.default.safeDump(swaggerSpec);
      } else {
        content = JSON.stringify(swaggerSpec, null, 2);
      }

      await writeFile(target, content, 'utf8');
      gasket.logger.info(`Wrote: ${definitionFile}`);
    }
  }
}
