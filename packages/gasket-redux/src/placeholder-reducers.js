/**
 * Sometimes we want to use redux to set app state with utilizing actions
 * or reducers, for consistency between browser and server rendering.
 * As such, if keys in preloadedState do not have corresponding reducers,
 * this will add placeholders.
 * @see https://redux.js.org/recipes/structuring-reducers/using-combinereducers#defining-state-shape
 * @type {import('./index').placeholderReducers}
 */
export default function placeholderReducers(
  reducers = {},
  preloadedState = {}
) {
  const keys = new Set(Object.keys(preloadedState));
  keys.add('config'); // from @gasket/plugin-config

  return Array.from(keys).reduce((acc, cur) => {
    if (!(cur in reducers)) acc[cur] = (f) => f || preloadedState[cur] || null;
    return acc;
  }, {});
}
