const isFunction = require('lodash.isfunction');
const isObject = require('lodash.isobject');

/**
 * Recurse through an object or array, and transforms, by mutation,
 * any functions to be empty.
 *
 * @param {Object|Array} value - Item to consider
 * @returns {Object|Array} transformed result
 * @private
 */
function sanitize(value) {
  if (isFunction(value)) {
    return function redacted() {};
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([k, v]) => {
      value[k] = sanitize(v);
    });
  }

  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      value[i] = sanitize(v);
    });
  }

  return value;
}

module.exports = {
  sanitize
};
