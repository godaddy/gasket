/**
 * Sometimes we want to use redux to set app state with utilizing actions
 * or reducers, for consistency between browser and server rendering.
 * As such, if keys in preloadedState do not have corresponding reducers,
 * this will add placeholders.
 *
 * @see: https://redux.js.org/recipes/structuring-reducers/using-combinereducers#defining-state-shape
 *
 * @param {Object.<string,function>} reducers - Reducers
 * @param {Object.<string,*>} preloadedState - State to preload store with
 * @returns {Object.<string,function>} placeholder reducers
 */
export default function placeholderReducers(reducers?: {
    [x: string]: Function;
}, preloadedState?: {
    [x: string]: any;
}): {
    [x: string]: Function;
};
