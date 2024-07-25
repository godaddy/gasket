import { configureAppRouterStore } from "@gasket/redux";
{{{reduxReducers.imports}}}

const reducers = {
{{{reduxReducers.entries}}}
};

const makeStore = configureAppRouterStore({ reducers });

export { makeStore };
