/**
 * Compose the reducer
 *
 * @param {Object.<string,function>} allReducers - Map of identifiers and reducers
 * @param {function} [rootReducer] - Entry reducer to run before combined reducers
 * @returns {function} reducer
 * @private
 */
export function prepareReducer(allReducers: {
    [x: string]: Function;
}, rootReducer?: Function): Function;
/**
 * Set up redux store configuration and return a makeStore function
 *
 * @param {Object} options - Options for create store
 * @param {Object.<string,function>} options.reducers - Map of identifiers and reducers
 * @param {function} [options.rootReducer] - Entry reducer to run before combined reducers
 * @param {Object.<string,*>} [options.initialState] - Initial redux state
 * @param {function[]} [options.middleware] - Middleware
 * @param {function[]} [options.enhancers] - Any additional enhancers
 * @param {boolean} [options.logging] - logging is enabled by default. Passing false will disable logging completely.
 * @param {function} [options.thunkMiddleware] - Optionally provide an extra argument for thunks
 * @param {function} [postCreate] - Optional callback
 * @returns {makeStoreFn} makeStore
 */
export default function configureMakeStore({ reducers, rootReducer, initialState, middleware, enhancers, logging, thunkMiddleware }?: {
    reducers: {
        [x: string]: Function;
    };
    rootReducer?: Function;
    initialState?: {
        [x: string]: any;
    };
    middleware?: Function[];
    enhancers?: Function[];
    logging?: boolean;
    thunkMiddleware?: Function;
}, postCreate?: Function): Function;
