/* eslint-disable complexity, max-statements */
import deepmerge from 'deepmerge';
import { default as semver } from 'semver';
import { default as diagnostics } from 'diagnostics';
const debug = diagnostics('gasket:cli:package');

/**
 * Simple object check without bringing in a large
 * utility library.
 * @param {*} value - What to test if an object
 * @returns {boolean} results
 */
function isObject(value) {
  return value && typeof value === 'object';
}

/*
 * Known semver prefix values.
 * Adapted from @vue/cli under MIT
 * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js#L53
 */
const semverPrefixes = /^(~|\^|>=?)/;

/*
 * Known package.json dependency values
 * Adapted from @vue/cli under MIT
 * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js#L10-L11
 */
const versionTypes = {
  uri: /^(?:file|git|git\+ssh|git\+http|git\+https|git\+file|https?):/,
  github: /^[^/]+\/[^/]+/
};

/**
 * Validates if the version `v` is valid for `package.json`
 * dependencies, devDependencies, etc.
 * @param  {string}  v Version in package.json field.
 * @returns {boolean} Value indicating if npm accepts the value
 */
function isValidVersion(v) {
  //
  // Remark: this explicitly forbids using npm dist-tags
  // as valid versions. To support this every call must hit an npm
  // registry to see what dist-tags are available. This is not feasible.
  //
  return v === 'latest'
    || v.match(versionTypes.uri) != null
    || v.match(versionTypes.github) != null
    || !!semver.validRange(v);
}

/**
 * ConfigBuilder is an extensible data structure for **specifically**
 * managing `package.json` data.
 * @type {import('../index.js').ConfigBuilder}
 */
export class ConfigBuilder {
  /**
   * ConfigBuilder
   * @param fields
   * @param options
   */
  constructor(fields = {}, options = {}) {
    this.fields = Object.assign({}, fields);
    this.original = fields;

    this.blame = new Map();
    this.force = new Set();

    this.orderBy = options.orderBy;
    this.orderedFields = options.orderedFields;
    this.objectFields = options.objectFields;
    this.semverFields = options.semverFields;
    this.warnings = options.warnings;
    this.source = options.source;

    // Any semverFields are also object fields and ordered fields.
    if (Array.isArray(this.semverFields)) {
      this.orderedFields = (this.orderedFields || []).concat(this.semverFields);
      this.objectFields = (this.objectFields || []).concat(this.semverFields);
    }
  }

  /**
   * Creator method to get a new instance
   * @param {object} [fields] - Initial fields
   * @param {object} [options] - Additional setup options
   * @returns {ConfigBuilder} instance
   */
  static create(fields = {}, options = {}) {
    return new ConfigBuilder(fields, options);
  }

  /**
   * Create an instance configured with options for package.json files
   * @param {object} [fields] - Initial fields
   * @param {object} [options] - Additional setup options
   * @returns {ConfigBuilder} instance
   */
  static createPackageJson(fields = {}, options = {}) {
    return new ConfigBuilder(fields, {
      ...options,
      orderBy: [
        'name',
        'version',
        'description',
        'license',
        'repository',
        'scripts',
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies'
      ],
      semverFields: [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies'
      ],
      objectFields: [
        'scripts'
      ]
    });
  }

  warn(message) {
    if (this.warnings) {
      this.warnings.push(message);
    } else {
      console.warn(message);
    }
  }

  /**
   * Adds all `[key, value]` pairs in the `fields` provided.
   * @param {object|function(current):object} fields - Object to merge.
   *    Can be a function that accepts the current fields and object to merge.
   * @param {object} source Plugin to blame if conflicts arise from this operation.
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L117-L150
   */
  extend(fields, source) {
    const current = this.fields;
    const toMerge = typeof fields === 'function'
      ? fields(current)
      : fields;

    // Silently ignore any falsey values
    if (!toMerge || typeof toMerge !== 'object') {
      return;
    }

    Object.entries(toMerge).forEach(([k, v]) => {
      this.add(k, v, source || this.source);
    });
  }

  /**
   * Performs an intelligent, domain-aware merge of the `value` for
   * the given `key` into the package.json fields associated with this instance.
   * @param {string} key - Field in package.json to add or extend.
   * @param {*} value - Target value to set for key provided.
   * @param {object} source - Plugin to blame if conflicts arise from this operation.
   * @param {object} [options] - Optional arguments for add behavior
   * @param {boolean} [options.force] - Should the semver version override other attempts
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L117-L150
   */
  add(key, value, source, options = {}) {
    if (typeof value === 'undefined') return;
    const existing = this.fields[key];
    const { name = 'Unknown plugin' } = (source || this.source || {});

    debug('add', { [key]: value, existing, from: name });
    if (Array.isArray(this.objectFields) && this.objectFields.includes(key)) {
      if (!isObject(value)) {
        throw new Error(`${key} must be an object. Received ${value}`);
      }

      if (Array.isArray(this.semverFields) && this.semverFields.includes(key)) {
        if (!existing) this.fields[key] = {};

        this.semanticMerge({
          key,
          value,
          existing: this.fields[key],
          name,
          ...options
        });

        return;
      }

      if (!existing) {
        this.fields[key] = Object.assign({}, value);
        return;
      }

      // TODO: ensure that conflicts are properly surfaced to users
      this.fields[key] = Object.assign({},
        existing || {},
        value
      );
    } else if (!(key in this.fields)) {
      this.fields[key] = value;
    } else if (Array.isArray(value) && Array.isArray(existing)) {
      this.fields[key] = this.mergeArrayDeduped(existing, value);
    } else if (isObject(value) && isObject(existing)) {
      this.fields[key] = deepmerge(existing, value, {
        arrayMerge: this.mergeArrayDeduped
      });
    } else {
      this.fields[key] = value;
    }
  }

  /**
   * Remove a key from fields
   * @param {string[]} path - Array of strings representing the path to the field to remove
   */
  remove(path) {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error('Path must be a non-empty array of strings');
    }

    let current = this.fields;
    for (let i = 0; i < path.length - 1; i++) {
      if (Object.prototype.hasOwnProperty.call(current, path[i])) {
        current = current[path[i]];
      } else {
        return; // Path does not exist
      }
    }

    const key = path[path.length - 1];
    if (Object.prototype.hasOwnProperty.call(current, key)) {
      delete current[key];
    }
  }

  /**
   * addPlugin - Add plugin import to the gasket file and use the value in the plugins array
   * @param {string} pluginImport - name of the import used as a value - `import pluginImport...`
   * @param {string} pluginName - name of the plugin import/package - `from 'pluginName'`
   * @example
   * addPlugin('pluginA', '@gasket/plugin-a')
   *
   * // gasket.js
   * import pluginA from '@gasket/plugin-a';
   *
   * export default makeGasket({
   *  plugins: [
   *    pluginA
   *  ]
   * });
   */
  addPlugin(pluginImport, pluginName) {
    this.add('plugins', [`${pluginImport}`]);
    this.add('pluginImports', { [pluginImport]: pluginName });
  }

  /**
   * addEnvironment - Add environments to the gasket file
   * @param {string} key - name of the environment - `local.analyze`
   * @param {object} value - configuration for the environment - `{
   *   dynamicPlugins: [
   *     '@gasket/plugin-analyze',
   *   ]
   * }`
   * @example
   *   environments: {
   *    'local.analyze': {
   *      dynamicPlugins: [
   *        '@gasket/plugin-analyze',
   *      ]
   *     }
   *   },
   */
  addEnvironment(key, value) {
    this.add('environments', {
      [key]: value
    });
  }

  /**
   * addCommand - Add commands to the gasket file
   * @param {string} key - name of the command - `docs`
   * @param {object} value - configuration for the command - `{
   *   dynamicPlugins: [
   *     '@gasket/plugin-docs',
   *   ]
   * }`
   * @example
   *   commands: {
   *    'docs': {
   *      dynamicPlugins: [
   *        '@gasket/plugin-docs',
   *      ]
   *     }
   *   },
   */
  addCommand(key, value) {
    this.add('commands', {
      [key]: value
    });
  }

  /**
   * addImport - Add a non-plugin import to the gasket file
   * @param {string} importName - name of the import used as a value - `import fs...`
   * @param {string} importPath - path of the import - `from 'fs'`
   * @returns {ConfigBuilder} - instance for chaining
   * @example
   * Can be default or named import
   * addImport('{ readFileSync }', 'fs')
   * addImport('fs', 'fs')
   *
   * // gasket.js
   * import { readFileSync } from 'fs';
   * import fs from 'fs';
   */
  addImport(importName, importPath) {
    this.add('imports', { [importName]: importPath });
    return this;
  }

  /**
   * addExpression - add programmatic expression to the gasket file
   * @param {string} expression - expression to add after imports
   * @returns {ConfigBuilder} - instance for chaining
   * @example
   *
   * .addImport('fs', 'fs')
   * .addExpression('const file = fs.readFileSync(\'./file.txt\')')
   *
   * // gasket.js
   * import fs from 'fs';
   * const file = fs.readFileSync('./file.txt');
   */
  addExpression(expression) {
    this.add('expressions', [expression.trim()]);
    return this;
  }

  /**
   * injectValue - Inject a value into the gasket config object
   * @param {string} configKey - collapsed object path to inject value into - `express.config.routes`
   * @param {string} injectedValue - string used as a value
   * @example
   * .addImport('{ routes }', './routes')
   * .injectValue('express.routes', 'routes');
   *
   * // gasket.js
   * export default makeGasket({
   *  express: {
   *    routes: routes
   *  }
   * });
   */
  injectValue(configKey, injectedValue) {
    this.add('injectionAssignments', { [configKey]: injectedValue });
  }

  /**
   * Checks if a dependency has been already added
   * @param  {string} key Dependency bucket
   * @param  {string} value Dependency to search
   * @returns {boolean} True if the dependency exists on the bucket
   */
  has(key, value) {
    const existing = this.fields[key];

    if (!existing) {
      return false;
    }

    if (Array.isArray(existing)) {
      return existing.includes(value);
    } else if (isObject(existing)) {
      return (value in existing);
    }

    return value === existing;
  }

  /**
   * Returns the existing and target array merged without duplicates
   * @param  {Array} existing Partial lattice to merge.
   * @param  {Array} target   Partial lattice to merge.
   * @returns {Array} existing ∪ (i.e. union) target
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L15
   */
  mergeArrayDeduped(existing, target) {
    return Array.from(new Set([...existing, ...target]));
  }

  /**
   * Attempts to merge all entries within the `value` provided by
   * the plugin specified by `name` into the `existing` semver-aware
   * Object `key` (e.g. dependencies, etc.) for this instance.
   *
   * Merge algorithm:
   *
   * - ∀   [dep, ver] := Object.entries(value)
   *   and [prev]     := any existing version for dep
   *
   *   - If ver is not valid semver ––> ■
   *   - If ¬∃ prev                 ––> set and blame [dep, ver]
   *   - If ver > prev              ––> set and blame [dep, ver]
   *   - If ¬(ver ∩ prev)           ––> Conflict. Print.
   * @param {object} options
   * @param  {string} options.key      {devD,peerD,optionalD,d}ependencies
   * @param  {object} options.value    Updates for { name: version } pairs
   * @param  {object} options.existing Existing { name: version } pairs
   * @param  {string} options.name     Plugin name providing merge `value``
   * @param {boolean} [options.force]  Should the semver version override other attempts
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js
   */
  semanticMerge({ key, value, existing, name, force = false }) {

    const setBlame = blameId => {
      this.blame.set(blameId, [name]);
      // debugger;
      if (force) this.force.add(blameId);
    };

    Object.entries(value).forEach(([dep, ver]) => {
      const prev = existing[dep];
      if (!isValidVersion(ver)) {
        this.warn(`Invalid "${key}" provided by ${name}: ${dep}@${ver}.`);
        return;
      }

      // If a prerelease version, strip the range prefix
      const version = ver.includes('-') ? ver.replace(/^[\^~]/, '') : ver;

      const blameId = `${key}.${dep}`;
      if (!prev) {
        existing[dep] = version;
        setBlame(blameId);
        return;
      }

      const blamed = this.blame.get(blameId);
      const forced = this.force.has(blameId);

      if (prev === version) {
        if (forced) return;
        if (force) {
          setBlame(blameId);
        } else {
          blamed.push(name);
        }
        return;
      }

      const prevName = blamed.join(', ');
      if (!forced) {
        const newer = force ? version : this.tryGetNewerRange(prev, version);
        const overridden = newer === version;
        if (overridden) {
          existing[dep] = version;
          setBlame(blameId);
        }
      }

      if (!semver.validRange(prev) || !semver.validRange(version) || !semver.intersects(prev, version)) {
        let forceMsg = force ? '(forced)' : '';
        forceMsg = forced && force ? '(cannot be forced)' : forceMsg;
        this.warn(`
  Conflicting versions for ${dep} in "${key}":
    - ${prev} provided by ${prevName} ${forced && '(forced)' || ''}
    - ${version} provided by ${name} ${forceMsg}
    Using ${existing[dep]}, but this may cause unexpected behavior.
`);
      }
    });
  }

  /**
   * Normalizes a potential semver range into a semver string
   * and returns the newest version
   * @param  {string} r1 Semver string (potentially invalid).
   * @param  {string} r2 Semver string (potentially invalid).
   * @returns {string | undefined} Newest semver version.
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js#L58-L64
   */
  tryGetNewerRange(r1, r2) {
    if (r1 === 'latest' || r2 === 'latest') {
      return r1 === 'latest' ? r1 : r2;
    }

    const v1 = this.rangeToVersion(r1);
    const v2 = this.rangeToVersion(r2);
    if (semver.valid(v1) && semver.valid(v2)) {
      return semver.gt(v1, v2) ? r1 : r2;
    }
  }

  /**
   * Performs a naive attempt to take a transform a semver range
   * into a concrete version that may be used for "newness"
   * comparison.
   * @param  {string} range Valid "basic" semver:   ^X.Y.Z, ~A.B.C, >=2.3.x, 1.x.x
   * @returns {string} Concrete as possible version: X.Y.Z,  A.B.C,   2.3.0, 1.0.0
   */
  rangeToVersion(range) {
    return range
      .replace(semverPrefixes, '')
      .replace(/x/g, '0')
      .trim();
  }

  /**
   * Orders top-level keys by `orderBy` options with any fields specified in
   * the `orderFields` options having their keys sorted.
   * @returns {object} Ready to be serialized JavaScript object.
   */
  toJSON() {
    if (Array.isArray(this.orderedFields)) {
      this.orderedFields.forEach(k => {
        if (this.fields[k]) {
          this.fields[k] = this.toOrderedKeys(this.fields[k]);
        }
      });
    }

    return this.toOrderedKeys(this.fields, this.orderBy);
  }

  /**
   * Orders the given object, `obj`, applying any (optional)
   * key order specified via `orderBy`. If no `orderBy` is provided
   * keys are ordered lexographically.
   * @param  {object}   obj       Object to transform to ordered keys
   * @param  {string[]} [orderBy] Explicit key order to use.
   * @returns {object} Shallow clone of `obj` with ordered keys
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/sortObject.js
   */
  toOrderedKeys(obj, orderBy) {
    if (!obj) return;

    // Create an optional order if necessary
    let order;
    if (Array.isArray(orderBy)) {
      order = orderBy.reduce((acc, key, i) => {
        acc[key] = i;
        return acc;
      }, {});
    }

    /*
     * Sorts based on the `order` defined above.
     */
    /**
     *
     * @param a
     * @param b
     */
    function sortByOrder(a, b) {
      const indexA = typeof order[a] === 'undefined'
        ? Infinity
        : order[a];

      const indexB = typeof order[b] === 'undefined'
        ? Infinity
        : order[b];

      return indexA - indexB;
    }

    const keys = order
      ? Object.keys(obj).sort(sortByOrder)
      : Object.keys(obj).sort();

    return keys.reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
  }
}
