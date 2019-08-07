/**
 * This file sets up the default makeStore function.
 * Apps can use custom configurations in which this file will be overridden
 * by webpack alias based the path in on the gasket.config.redux.makeStore
 */
module.exports = require('./lib/configure-make-store').default();
