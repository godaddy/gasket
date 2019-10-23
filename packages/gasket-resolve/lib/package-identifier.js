/**
 * Generate RegExp to help determine aspects of an identifier for a project
 *
 * @param {string} projectName - Name of the project
 * @param {string} [type] - Identifier type, defaults to 'plugin'
 * @returns {{prefixed: {project: RegExp, user: RegExp}, postfixed: {project: RegExp, user: RegExp}, scope: RegExp}}
 */
function matchMaker(projectName, type = 'plugin') {
  if (!projectName) throw new Error('projectName required.');
  return {
    prefixed: {
      project: new RegExp(`(@${projectName})\/${type}-([\\w-.]+)`),
      user: new RegExp(`(@[\\w-.]+)?\\/?${projectName}-${type}-([\\w-.]+)`)
    },
    postfixed: {
      project: new RegExp(`(@${projectName})\/([\\w-.]+)-${type}`),
      user: new RegExp(`(@[\\w-.]+)?\\/?([\\w-.]+)-${projectName}-${type}`)
    },
    scope: /(@[\w-.]+)\/.+/,
    name: /^(@?[\w/-]+)@?(.*)/
  };
}

/**
 * Generate helpers to expand short names to long names for identifiers of a project
 *
 * @param {string} projectName - Name of the project
 * @param {string} [type] - Identifier type, defaults to 'plugin'
 * @returns {{prefixed: prefixed, postfixed: postfixed}}
 */
function expandMaker(projectName, type = 'plugin') {
  if (!projectName) throw new Error('projectName required.');
  const projectScope = `@${projectName}`;
  const parse = short => short.split('/').reverse();
  return {
    prefixed: short => {
      const [name, scope] = parse(short);
      if (scope === projectScope) {
        return `${projectScope}/${type}-${name}`;
      }
      const result = `${projectName}-${type}-${name}`;
      return scope ? `${scope}/${result}` : result;
    },
    postfixed: short => {
      const [name, scope] = parse(short);

      if (scope === projectScope) {
        return `${projectScope}/${name}-${type}`;
      }
      const result = `${name}-${projectName}-${type}`;
      return scope ? `${scope}/${result}` : result;
    }
  };
}

/**
 * @typedef {Object} IdentifierFormat
 *
 * @property {boolean} prefixed
 * @property {boolean} short
 * @property {boolean} project
 * @property {boolean} scoped
 */


function makePackageIdentifier(projectName, options) {
  const { type = 'plugin' } = options || {};
  const re = matchMaker(projectName, type);
  const expand = expandMaker(projectName, type);
  const projectScope = `@${projectName}`;

  const isScopedFn = name => re.scope.test(name);
  const isShortFn = name => !(name.includes(projectName) && name.includes(type));
  const isPrefixedFn = name => re.prefixed.project.test(name) || re.prefixed.user.test(name);
  const isProjectScopedFn = name => name.startsWith(projectScope);

  /**
   * Utility class for working with package names and versions
   *
   * @type {PackageIdentifier}
   */
  class PackageIdentifier {
    /**
     * Create a new package identifier instance
     *
     * @param {String} rawName - Original input name of a package
     * @param {Object} [options] - Options
     * @param {boolean} [options.prefixed] - Disable this to force prefixed/postfixed format for short names
     */
    constructor(rawName, options = {}) {
      this.rawName = rawName;

      const [, name, version] = re.name.exec(this.rawName);

      this._parsed = {
        name,
        version
      };

      const short = isShortFn(name);
      const scoped = isScopedFn(name);
      const project = isProjectScopedFn(name);
      const {
        // default to prefixed for short names
        prefixed = short ? true : isPrefixedFn(name)
      } = options;

      /**
       * @type {Readonly<IdentifierFormat>}
       * @private
       */
      this._format = Object.freeze({
        short,
        prefixed,
        scoped,
        project
      });

      this._expand = prefixed ? expand.prefixed : expand.postfixed;
      this._re = (prefixed ? re.prefixed : re.postfixed)[project ? 'project' : 'user'];
    }

    /**
     * Get the full package name
     *
     * Examples:
     * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
     * - @gasket/https -> @gasket/plugin-https
     *
     * @returns {string} fullName
     */
    get fullName() {
      const { name } = this._parsed;

      if (this._format.short) {
        return this._expand(name);
      }

      return name;
    }

    /**
     * Get the long package name
     *
     * @alias fullName
     * @returns {string} fullName
     */
    get longName() {
      return this.fullName;
    }

    /**
     * Get the short package name
     *
     * Examples:
     * - @gasket/https-plugin -> https
     * - https@1.2.3 -> https
     *
     * @returns {string} fullName
     */
    get shortName() {
      const { name } = this._parsed;

      if (this._format.short) {
        return name;
      }

      const matches = this._re.exec(name);
      return matches[1] ? `${matches[1]}/${matches[2]}` : matches[2];
    }

    /**
     * Get only the package name
     *
     * Examples:
     * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin
     * - https@1.2.3 -> https
     *
     * @returns {string} fullName
     */
    get name() {
      const { name } = this._parsed;

      return name;
    }

    /**
     * Get only the package version
     *
     * Examples:
     * - @gasket/https-plugin@1.2.3 -> 1.2.3
     * - @gasket/https-plugin -> ''
     *
     * @returns {string} fullName
     */
    get version() {
      const { version } = this._parsed;

      return version || null;
    }

    /**
     * Get the full package name with version
     *
     * Examples:
     * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
     * - https@1.2.3 -> @gasket/https-plugin@1.2.3
     *
     * @returns {string} fullName
     */
    get full() {
      const name = this.fullName;
      const version = this.version;
      return name + (version ? `@${version}` : '');
    }

    get isShort() {
      return this._format.short;
    }

    get isLong() {
      return !this._format.short;
    }

    get isPrefixed() {
      return this._format.prefixed;
    }

    get isPostfixed() {
      return !this._format.prefixed;
    }

    get hasScope() {
      return this._format.scoped;
    }

    get hasProjectScope() {
      return this._format.project;
    }

    get hasVersion() {
      return Boolean(this._parsed.version);
    }

    /**
     * Returns new PackageIdentifier with version added to desc if missing
     *
     * Examples:
     * - @gasket/https-plugin@1.2.3 -> @gasket/https-plugin@1.2.3
     * - @gasket/https-plugin -> @gasket/https-plugin@latest
     *
     * @param {string} [defaultVersion] - the version name to add if missing
     * @returns {PackageIdentifier} identifier
     */
    withVersion(defaultVersion = 'latest') {
      const { name, version } = this._parsed;

      const nextName = name + '@' + (version || defaultVersion);
      return new this.constructor(nextName, this.format);
    }

    /**
     * If the rawName is short format, get a new identifier, cycling through
     * formats, used to attempt to resolve packages by different name pattern.
     *
     * example            gasket-plugin-example > example-gasket-plugin
     *                    > @gasket/plugin-example > @gasket/example-plugin   -- In Loader, falls back to these with warnings
     * @gasket/example    @gasket/plugin-example > @gasket/example-plugin
     * @user/example      @user/gasket-plugin-example > @user/example-gasket-plugin
     *
     * @returns {PackageIdentifier|null} identifier
     */
    nextFormat() {
      if (!this._format.short) return null;

      let rawName = this.rawName;

      const nextFormat = {};
      if (this._format.prefixed) {
        nextFormat.prefixed = false;
      } else {
        // If we don't have a scope, force to project scope
        if (!this._format.scoped) {
          rawName = `${projectScope}/${rawName}`;
          nextFormat.prefixed = true;
        }
      }

      //
      // if there is nothing to change, return null
      //
      if (!Object.keys(nextFormat).length && rawName === this.rawName) {
        return null;
      }

      return new this.constructor(rawName, { ...this._format, ...nextFormat });
    }
  }

  /**
   * Output the original raw name for string concatenation.
   *
   * @returns {String} string
   */
  PackageIdentifier.prototype.toString = function toString() {
    return this.rawName;
  };

  function packageIdentifier(name, format) {
    return new PackageIdentifier(name, format);
  }

  /**
   * Util method to check if a full name is valid
   *
   * Examples:
   * - @gasket/https-plugin -> true
   * - @gasket/https-plugin@1.2.3 -> false
   * - https -> false
   *
   * @param {string} maybeFullName - Name to check
   * @returns {boolean} fullName
   */
  packageIdentifier.isValidFullName = function isValidFullName(maybeFullName) {
    try {
      return new PackageIdentifier(maybeFullName).fullName === maybeFullName;
    } catch (e) {
      return false;
    }
  };

  /**
   * Util method to loop through format options for short names.
   * The handler will be provide the next formatted identifier to try,
   * which should return falsy to continue,
   * or return truthy to end and return the current identifier.
   *
   * @param {string} name - Name to check
   * @param {function(PackageIdentifier)} handler - Attempt to find package current format
   * @returns {PackageIdentifier|null} identifier
   */
  packageIdentifier.lookup = function (name, handler) {
    let result;
    let identifier;
    do {
      identifier = identifier ? identifier.nextFormat() : new PackageIdentifier(name);
      result = identifier && handler(identifier);
    } while (!result && identifier);

    return identifier;
  };

  return packageIdentifier;
}

module.exports = {
  matchMaker,
  expandMaker,
  makePackageIdentifier
};
