/**
 * Helper to check for an existing store on context, otherwise make a new instance.
 *
 * @param {function} fallbackMakeStore - A makeStore function to create new stores
 * @returns {function(object): Store} getOrCreateStore
 */
export default function getOrCreateStore(fallbackMakeStore) {
  return function checkContext(ctx = {}) {
    // normalize Page and App context from Next.js
    const _ctx = ctx.ctx || ctx;
    // If there's a req object check for store
    if (_ctx.req && _ctx.req.store) return _ctx.req.store;
    // Check if store is directly on context
    if (_ctx.store) return _ctx.store;
    // Otherwise create new instance
    return fallbackMakeStore();
  };
}
