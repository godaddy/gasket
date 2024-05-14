/// <reference types="@gasket/cli" />
const path = require('path');

/**
 * Create hook adds template files if gitInit
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const { gitInit, files } = context;

  if (gitInit) {
    files.add(path.join(__dirname, '..', 'generator', '.*'));
  }
};
