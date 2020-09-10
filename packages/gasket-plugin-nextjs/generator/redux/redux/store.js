const { configureMakeStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
{{{reduxReducers.imports}}}

// Basic hydrate reducer for next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
const rootReducer = (state, { type, payload }) => type === HYDRATE ? { ...state, ...payload } : state;

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(({ req }) => makeStore({}, { req }));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
