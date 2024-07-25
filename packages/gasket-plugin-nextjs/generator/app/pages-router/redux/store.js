import { configureMakeStore, getOrCreateStore } from '@gasket/redux';
import { HYDRATE, createWrapper } from 'next-redux-wrapper';
import merge from 'lodash.merge';
{{{reduxReducers.imports}}}

// Basic hydrate reducer for next-redux-wrapper
// @see: https://github.com/kirill-konshin/next-redux-wrapper#usage
const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

export { makeStore, nextRedux };
