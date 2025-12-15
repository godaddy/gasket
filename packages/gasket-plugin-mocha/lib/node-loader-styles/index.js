const path = require('path');
const { pathToFileURL } = require('url');

// Extended regex for matching common CSS-related file extensions
const styleFileRegex = /\.(css|scss|sass|less|styl)$/;

/**
 * Custom resolver that intercepts CSS and style file imports
 * @param {string} specifier - The module specifier being resolved
 * @param {object} context - The resolution context from Node.js
 * @param {Function} defaultResolve - Node.js default resolution function
 * @returns {object} Resolution result with url and shortCircuit flag
 */
function resolve(specifier, context, defaultResolve) {
  // Use the regex to check if the file is a CSS or related file
  if (styleFileRegex.test(specifier)) {
    const filePath = path.resolve(__dirname, 'empty-module.js');
    return {
      url: pathToFileURL(filePath).href,
      shortCircuit: true
    };
  }
  return defaultResolve(specifier, context, defaultResolve);
}

/**
 * Custom loader that returns empty module for CSS files
 * @param {string} url - The module URL being loaded
 * @param {object} context - The load context from Node.js
 * @param {Function} defaultLoad - Node.js default load function
 * @returns {object} Load result with format, source, and shortCircuit flag
 */
function load(url, context, defaultLoad) {
  // Handle loading for the 'empty-module.js' placeholder
  if (url.endsWith('empty-module.js')) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true
    };
  }
  return defaultLoad(url, context, defaultLoad);
}

module.exports = {
  resolve,
  load
};
