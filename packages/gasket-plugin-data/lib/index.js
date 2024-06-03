const { name } = require('../package.json');
const create = require('./create');
const configure = require('./configure');
const { actions } = require('./actions');
const middleware = require('./middleware');
const initReduxState = require('./init-redux-state');
const metadata = require('./metadata');

/**
 * @type {import('@gasket/core').Plugin}
 */
module.exports = {
  name,
  hooks: {
    create,
    configure,
    actions,
    middleware,
    initReduxState,
    metadata
  }
};
