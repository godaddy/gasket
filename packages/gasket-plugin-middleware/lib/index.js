const { name, version, description } = require('../package.json');
const express = require('./express');
const fastify = require('./fastify');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create(gasket, { pkg, gasketConfig }) {
      gasketConfig.addPlugin('pluginMiddleware', name);
      pkg.add('dependencies', {
        [name]: `^${version}`
      });
    },
    express,
    fastify
  }
};

module.exports = plugin;
