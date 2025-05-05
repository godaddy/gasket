// Forked from https://github.com/node-loader/node-loader-babel
const babel = require('@babel/core');
const path = require('path');
const urlModule = require('url');
const { loadOptionsAsync, transformAsync } = babel;

/**
 *
 * @param filename
 */
function isBabelConfigFile(filename) {
  const basename = path.basename(filename);
  return (
    basename === '.babelrc.js' ||
    basename === '.babelrc.mjs' ||
    basename === 'babel.config.js' ||
    basename === 'babel.config.mjs' ||
    basename === '.babelrc' ||
    basename === '.babelrc.cjs' ||
    basename === 'babel.config.cjs'
  );
}

// The formats that babel can compile
// It cannot compile wasm/json
const supportedModuleFormats = ['module', 'commonjs'];

/**
 * Custom loader for Node.js that allows you to compile all files with babel before they are executed in Node.
 * @type {import('./index.js').load}
 */
async function load(url, context, defaultLoad) {
  if (useLoader(url)) {
    if (url.endsWith('.ts') || url.endsWith('.tsx')) {
      // defaultLoad throws ERR_UNKNOWN_FILE_EXTENSION unless we tell it a module format
      // We assume typescript users are using ESM rather than CJS, for simplicity
      context.format = 'module';
    }

    const { source, format } = await defaultLoad(url, context, defaultLoad);

    // NodeJS' implementation of defaultLoad returns a source of `null` for CommonJS modules.
    // So we just skip compilation when it's commonjs until a future day when NodeJS (might) support that.
    // Also, we skip compilation of wasm and json modules by babel, since babel isn't needed or possible
    // in those situations
    if (!source || (format && !supportedModuleFormats.includes(format))) {
      return { source, format };
    }

    const filename = urlModule.fileURLToPath(url);

    // Babel config files can themselves be ES modules,
    // but we cannot transform those since doing so would cause an infinite loop.
    if (isBabelConfigFile(filename)) {
      return {
        source,
        format: /\.(c|m)?js$/.test(filename) ? 'module' : 'json'
      };
    }

    const options = await loadOptionsAsync({
      sourceType: format || 'module',
      root: `${process.cwd()}/test/`,
      rootMode: 'root',
      filename: filename,
      configFile: `${process.cwd()}/test/.babelrc`
    });

    const transformed = await transformAsync(source, options);

    return {
      source: transformed.code,
      // Maybe a shaky assumption
      // TODO: look at babel config to see whether it will output ESM/CJS or other formats
      format: 'module'
    };
  }
  return defaultLoad(url, context, defaultLoad);
}

/**
 *
 * @param url
 */
function useLoader(url) {
  return !/node_modules/.test(url) && !/node:/.test(url);
}

module.exports = { load };
