/** @typedef {import('../internal.d.ts').ModuleDocsConfig} ModuleDocsConfig */

/**
 * Sort an array of names alphabetically.
 * @param {string} a - Name
 * @param {string} b - Name
 * @returns {number} comparison
 */
function alphaCompare(a, b) {
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

/**
 * Makes a sort compare function that looks up a names weight
 * @param {Function} getWeight - Weight lookup callback
 * @returns {Function} compare
 */
function makeWeightedCompare(getWeight) {
  return function weightedCompare(a, b) {
    const aWeight = getWeight(a);
    const bWeight = getWeight(b);

    if (aWeight !== bWeight) {
      return aWeight > bWeight ? -1 : 1;
    }

    return alphaCompare(a, b);
  };
}

/**
 * Returns a function to sort an array of objects by a given key and compare
 * function
 * @param {string} key - Property to sort by
 * @param {Function} compare - Sort function
 * @returns {function(Array):Array} sorter
 */
function sortByKey(key, compare) {
  return function sorter(arr) {
    return arr.sort((a, b) => compare(a[key], b[key]));
  };
}

/**
 * Determine the weight of a package name by scope, followed by type.
 * - gasket scope > user scope > no scope > app plugins
 * - plugins > packages
 * @param {string} name - Package name
 * @returns {number} weight
 */
function getModuleWeight(name) {
  //
  // weight from scope
  //
  const isGasketScope = /^@gasket/;
  const isUserScope = /^@/;
  const isAppPlugin = /^plugins\//;

  let weight =
    (isGasketScope.test(name) && 300) ||
    (isUserScope.test(name) && 200) ||
    (!isAppPlugin.test(name) && 100) ||
    0;

  //
  // weight from type
  //
  const isPlugin = /plugin/;

  weight += (isPlugin.test(name) && 10) || 0;

  return weight;
}

/**
 * Sort an array of modules by name
 * @type {function(ModuleDocsConfig[]): ModuleDocsConfig[]}
 */
const sortModules = sortByKey('name', makeWeightedCompare(getModuleWeight));

/**
 * Use the same module weight by name, yet cli is always first
 * @param {string} name - Package name
 * @returns {number} weight
 */
function getGuideWeight(name) {
  const isCli = /^@gasket\/cli/;

  return (isCli.test(name) && 1000) || getModuleWeight(name);
}

/**
 * Sort an array of guides by the module their from
 * @type {function(ModuleDocsConfig[]): ModuleDocsConfig[]}
 */
const sortGuides = sortByKey('from', makeWeightedCompare(getGuideWeight));

/**
 * Determine the weight of a structure name by its type.
 * - hidden dirs > dirs > hidden files > files
 * @param {string} name - Structure name
 * @returns {number} weight
 */
function getStructureWeight(name) {
  const isDir = /\/$/;
  const isHidden = /^\./;

  return (
    (isDir.test(name) && isHidden.test(name) && 1000) ||
    (isDir.test(name) && 100) ||
    (isHidden.test(name) && 10) ||
    0
  );
}

/**
 * Sort an array of structures by name
 * @type {function(import('../internal.d.ts').DetailDocsConfig[]):
 * import('../internal.d.ts').DetailDocsConfig[]}
 */
const sortStructures = sortByKey(
  'name',
  makeWeightedCompare(getStructureWeight)
);

/**
 * Sort an array of commands by name
 * @type {function(import('../internal.d.ts').DetailDocsConfig[]):
 * import('../internal.d.ts').DetailDocsConfig[]}
 */
const sortCommands = sortByKey('name', alphaCompare);

/**
 * Sort an array of actions by name
 * @type {function(import('../internal.d.ts').DetailDocsConfig[]):
 * import('../internal.d.ts').DetailDocsConfig[]}
 */
const sortActions = sortByKey('name', alphaCompare);

/**
 * Sort an array of lifeycles by name
 * @type {function(import('../internal.d.ts').DetailDocsConfig[]):
 * import('../internal.d.ts').DetailDocsConfig[]}
 */
// TODO (kinetifex): eventually sort by parent and order when doing graphing
// work
const sortLifecycles = sortByKey('name', alphaCompare);

/**
 * Sort an array of configurations by name
 * @type {function(import('../internal.d.ts').DetailDocsConfig[]):
 * import('../internal.d.ts').DetailDocsConfig[]}
 */
const sortConfigurations = sortByKey('name', alphaCompare);

export {
  sortModules,
  sortGuides,
  sortStructures,
  sortCommands,
  sortActions,
  sortLifecycles,
  sortConfigurations
};
