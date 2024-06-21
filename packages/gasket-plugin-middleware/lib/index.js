/// <reference types="create-gasket-app" />

const { name, version, description } = require('../package.json');
const create = require('./create');
const express = require('./express');
const fastify = require('./fastify');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    create,
    express,
    fastify
  }
};

module.exports = plugin;
