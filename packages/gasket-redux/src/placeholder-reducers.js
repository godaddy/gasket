/**
 * Sometimes we want to use redux to set app state with utilizing actions
 * or reducers, for consistency between browser and server rendering.
 * As such, if keys in preloadedState do not have corresponding reducers,
 * this will add placeholders.
 *
 * @see: https://redux.js.org/recipes/structuring-reducers/using-combinereducers#defining-state-shape
 *
 * @param {Object} reducers - Reducers
 * @param {Object} preloadedState - State to preload store with
 * @returns {Object} placeholder reducers
 */
export default function placeholderReducers(reducers = {}, preloadedState = {}) {
  return Object.keys(preloadedState).reduce((acc, cur) => {
    if (!(cur in reducers)) acc[cur] = f => f || preloadedState[cur] || null;
    return acc;
  }, {});
}
