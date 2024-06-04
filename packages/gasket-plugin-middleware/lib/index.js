const { name } = require('../package.json');
const express = require('./express');
const fastify = require('./fastify');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    express,
    fastify
  }
};

module.exports = plugin;
