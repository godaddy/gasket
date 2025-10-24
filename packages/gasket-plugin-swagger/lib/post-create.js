import buildSwaggerDefinition from './build-swagger-definition.js';
import path from 'path';

/** @type {import('@gasket/core').HookHandler<'postCreate'>} */
export default async function postCreateHook(gasket, createContext) {
  const root = createContext.dest;
  const { jsdoc } = createContext.gasketConfig.fields.swagger;
  const apis = jsdoc.apis.map(glob =>  path.join(root, glob));
  const swagger = {
    jsdoc: {
      ...jsdoc,
      apis
    }
  };
  await buildSwaggerDefinition(gasket, { root, swagger });
}
