/// <reference types="@gasket/cli" />

const { makeSafeRunScript } = require('./utils');
const prompt = require('./prompt');
const create = require('./create');

const { name } = require('../package.json');

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    prompt,
    create,
    async postCreate(gasket, context, { runScript }) {
      const safeRunScript = makeSafeRunScript(context, runScript);
      await safeRunScript('lint:fix');
      await safeRunScript('stylelint:fix');
    }
  }
};

module.exports = plugin;
