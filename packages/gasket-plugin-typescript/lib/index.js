/// <reference types="@gasket/core" />

const {
  name,
  version,
  description
} = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
module.exports = {
  name,
  version,
  description,
  hooks: {}
};
