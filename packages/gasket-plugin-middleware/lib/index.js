const { name, version, description } = require('../package.json');
const express = require('./express');
const fastify = require('./fastify');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    express,
    fastify
  }
};

module.exports = plugin;
