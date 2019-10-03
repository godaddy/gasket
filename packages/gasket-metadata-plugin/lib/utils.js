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

/**
 * Add keys to from other object to the target if not present
 *
 * @param {Object} target - Object to mutate
 * @param {Object} other - Object to pull from
 */
function expand(target, other) {
  Object.keys(other)
    .reduce((acc, key) => {
      if (!(key in acc)) acc[key] = other[key];
      return acc;
    }, target);
}

module.exports = {
  sanitize,
  expand
};
