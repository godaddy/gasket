/// <reference types="create-gasket-app" />

const { makeSafeRunScript } = require('./utils');
const prompt = require('./prompt');
const create = require('./create');

const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    prompt,
    create,
    // @ts-expect-error - TODO: fix this
    async metadata(gasket, meta) {
      return meta;
    },
    async postCreate(gasket, context, { runScript }) {
      const safeRunScript = makeSafeRunScript(context, runScript);
      await safeRunScript('lint:fix');
      await safeRunScript('stylelint:fix');
    }
  }
};

module.exports = plugin;
