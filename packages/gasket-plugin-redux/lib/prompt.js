/**
 * Class to add statements to redux store.
 */
class ReduxReducers {
  constructor() {
    /** @type {string[]} */
    this._imports = [];
    /** @type {string[]} */
    this._entries = [];
  }

  /**
   * Add an import statement for reducers This should string formatted as a
   * CommonJS require
   * @example
   * reduxReducers.addImport("const exampleReducers = require('@example/reducers');")
   * @param {string} str - Import statement
   */
  addImport(str) {
    this._imports.push(str);
  }

  /**
   * Add reducers This should be in CommonJS format
   * @example
   * // as an object of reducers
   * reduxReducers.addEntry('...exampleReducers')
   * // const reducers = {
   * //  ...exampleReducers
   * // }
   * @example
   * // as a single reducer
   * reduxReducers.addEntry('example: exampleReducer')
   * // const reducers = {
   * //  example: exampleReducer
   * // }
   * @param {string} str - Import statement
   */
  addEntry(str) {
    this._entries.push(str);
  }
}

/**
 * Prompt lifecycle hook
 *
 * We do not actually prompt from here, but rather use this lifecycles to make
 * sure the ReduxReducers instances is available on context during the create
 * lifecycle.
 * @type {import('@gasket/engine').HookHandler<'prompt'>}
 */
module.exports = function prompt(gasket, context) {
  const reduxReducers = new ReduxReducers();

  // These getters are used in the handlebars template and cannot be on the
  // prototype @see:
  // https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access
  Object.defineProperties(reduxReducers, {
    entries: {
      get() {
        const indent = '  ';
        return indent + this._entries.join(',\n' + indent);
      }
    },
    imports: {
      get() {
        return this._imports.join('\n');
      }
    }
  });

  return { ...context, reduxReducers };
};
