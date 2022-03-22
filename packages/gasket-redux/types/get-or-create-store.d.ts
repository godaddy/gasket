/**
 * Helper to check for an existing store on context, otherwise make a new instance.
 *
 * @param {function} fallbackMakeStore - A makeStore function to create new stores
 * @returns {function(object): object} getOrCreateStore
 */
export default function getOrCreateStore(fallbackMakeStore: Function): (arg0: object) => object;
