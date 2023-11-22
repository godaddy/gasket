const build = require('./build');
const configure = require('./configure');
const create = require('./create');
const express = require('./express');
const fastify = require('./fastify');

module.exports = {
  name: require('../package').name,
  hooks: {
    build,
    configure,
    create,
    express,
    fastify,
    metadata: (gasket, meta) => ({
      ...meta,
      configurations: [{
        name: 'swagger',
        link: 'README.md#configuration',
        description: 'Swagger config object',
        type: 'object'
      }, {
        name: 'swagger.definitionFile',
        link: 'README.md#configuration',
        description: 'Target swagger spec file, either json or yaml',
        type: 'string',
        default: 'swagger.json'
      }, {
        name: 'swagger.apiDocsRoute',
        link: 'README.md#configuration',
        description: 'Route to Swagger UI',
        type: 'string',
        default: '/api-docs'
      }, {
        name: 'swagger.jsdoc',
        link: 'README.md#configuration',
        description: 'If set, the definitionFile will be generated based on JSDocs in the configured files',
        type: 'object'
      }, {
        name: 'swagger.ui',
        link: 'README.md#configuration',
        description: 'Optional custom UI options',
        type: 'object'
      }],
      lifecycles: [{
        name: 'swaggerExpressMiddleware',
        method: 'exec',
        description: 'Inject express middleware before Swagger UI handlers',
        link: 'README.md#swaggerExpressMiddleware',
        parent: 'express'
      }, {
        name: 'swaggerMiddleware',
        method: 'exec',
        description: 'Inject fastify middleware before Swagger UI handlers',
        link: 'README.md#swaggerFastifyMiddleware',
        parent: 'fastify'
      }]
    })
  }
};
