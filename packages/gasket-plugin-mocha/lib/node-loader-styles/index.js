const path = require('path');
const { pathToFileURL } = require('url');

// Extended regex for matching common CSS-related file extensions
const styleFileRegex = /\.(css|scss|sass|less|styl)$/;

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
