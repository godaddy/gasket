const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
const merge = require('lodash.merge')
{{{reduxReducers.imports}}}

// Basic hydrate reducer for next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
