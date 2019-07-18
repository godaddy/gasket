const assume = require('assume');
const Module = require('module');
const path = require('path');

/**
 * What the actual f*ck is this monstrosity you might ask your self. Story time
 * children! We needed to find a way to assert if a file was required and
 * executed. All current solution at this time of writing allows you to stub
 * methods of files that are required. This does not work for this specific case:
 *
 * ```js
 * require(./foo)
 * ```
 *
 * There are no methods called, just initialization of a module and "stuff"
 * happens. So in order to figure out if a module was actually accessed we
 * need know if `node` accesses the `exports` property of the cache as that
 * is the value that is getting returned when you require a module. So by
 * faking an entry in the cache, with a `Proxy` instance that will trigger
 * when the `exports` property is accessed was the easiest way to go about
 * this.
 *
 * @param {String} id The full path to the dependency that we need to assert.
 * @param {Function} fn Completion callback once `exports` is accessed.
 * @returns {Function} Restores node to it's original self.
 * @public
 */
function required(id, fn) {
  const _resolveFilename = Module._resolveFilename;
  const old = require.cache[id];

  require.cache[id] = new Proxy({
    filename: id,
    loaded: true,
    parent: null,
    id
  }, {
    get: function (obj, key) {
      if (key === 'exports') return fn(obj);

      return obj[key];
    }
  });

  Module._resolveFilename = function (resolve, parent) {
    if (resolve === id) return id;

    return _resolveFilename(resolve, parent);
  };

  return function restore() {
    if (_resolveFilename) Module._resolveFilename = _resolveFilename;
    if (old) require.cache[id] = old;
  };
}

describe('local-cli', function () {
  const root = path.join(__dirname, '..', '..');
  const bin = path.join(root, 'node_modules', '@gasket', 'cli', 'bin');
  const preboot = path.join(root, 'bin', 'boot');

  it('uses preboot as bin file', function () {
    assume(require('../../package.json').bin.gasket).equals('./bin/boot');
  });

  it('requires the node_modules cli', function (next) {
    delete require.cache[preboot];

    const restore = required(path.join(bin, 'run'), function () {
      setTimeout(function () {
        restore();
        next();
      }, 0);

      return {};
    });

    require(preboot);
  });

  it('requires our own cli when no local-cli is found', function (next) {
    delete require.cache[preboot];

    const restore = required(path.join(root, 'bin', 'run'), function () {
      setTimeout(function () {
        restore();
        next();
      }, 0);

      return {};
    });

    require(preboot);
  });
});
