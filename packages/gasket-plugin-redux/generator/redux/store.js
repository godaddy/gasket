const { configureMakeStore } = require('@gasket/redux');
{{{reduxReducers.imports}}}

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureMakeStore({ reducers });

module.exports = makeStore;
