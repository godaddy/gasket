const { name, version, description } = require('../package.json');
const create = require('./create');
const configure = require('./configure');
const { actions } = require('./actions');
const initReduxState = require('./init-redux-state');
const metadata = require('./metadata');

/**
 * @type {import('@gasket/core').Plugin}
 */
module.exports = {
  name,
  version,
  description,
  actions,
  hooks: {
    create,
    configure,
    initReduxState,
    metadata
  }
};
