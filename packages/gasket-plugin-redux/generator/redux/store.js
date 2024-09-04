import { configureMakeStore } from '@gasket/redux';
{{{reduxReducers.imports}}}

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureMakeStore({ reducers });

export default makeStore;
