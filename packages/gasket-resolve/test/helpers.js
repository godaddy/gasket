/* istanbul ignore file */

const isModulePath = /^[/.]|node_modules/;


function notFoundError(mod) {
  const err = new Error(`Cannot find module '${ mod }' from 'mocked'`);
  err.code = 'MODULE_NOT_FOUND';
  return err;
}

function missingExportError(mod) {
  const err = new Error(`Package subpath './package.json' is not defined by "exports" in /path/to/node_modules/${ mod }`);
  err.code = 'ERR_PACKAGE_PATH_NOT_EXPORTED';
  return err;
}


function makeRequire(modules) {
  const _paths = {};
  const _modules = {};
  Object.keys(modules).forEach(name => {
    const pth = isModulePath.test(name) ? name : '/path/to/node_modules/' + name;
    const windowsPth = isModulePath.test(name) ? name : 'C:\\path\\to\\node_modules\\' + name.replace('/', '\\');
    _paths[name] = pth;
    _paths[pth] = pth;
    _paths[windowsPth] = pth;
    _modules[name] = modules[name];
    _modules[pth] = modules[name];
    _modules[windowsPth] = modules[name];
  });

  _paths.broken = '/path/to/node_modules/broken';
  Object.defineProperty(_modules, '/path/to/node_modules/broken', {
    get: function () { throw new Error('Bad things'); }
  });

  const _require = jest.fn(mod => {
    if (_modules[mod]) {
      return _modules[mod];
    }
    throw notFoundError(mod);
  });

  _require.resolve = jest.fn(mod => {
    if (_paths[mod]) {
      return _paths[mod];
    }
    if (mod === 'no-exported/package.json') {
      throw missingExportError(mod);
    }
    if (mod === 'windows-paths/missing') {
      throw notFoundError(`C:\\some-app\\node_modules\\windows-paths\\missing.js`);
    }
    throw notFoundError(mod);
  });

  return _require;
}

module.exports = {
  makeRequire
};
