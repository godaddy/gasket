/// <reference types="@gasket/plugin-start" />

const path = require('path');

const { createConfig } = require('./utils/config');

/** @type {import('@gasket/engine').HookHandler<'build'>} */
module.exports = async function build(gasket) {
  const { command } = gasket;

  // Don't do a build, use dev server for local
  if ((command.id || command) === 'local') return;

  const builder = require('next/dist/build').default;

  return await builder(path.resolve('.'), await createConfig(gasket, true));
};
