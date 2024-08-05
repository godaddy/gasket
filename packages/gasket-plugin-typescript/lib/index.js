/// <reference types="@gasket/core" />

const {
  name,
  version,
  description
} = require('../package.json');
const create = require('./create');

/** @type {import('@gasket/core').Plugin} */
module.exports = {
  name,
  version,
  description,
  hooks: {
    create
  }
};
