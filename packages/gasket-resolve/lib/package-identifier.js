const reScope = /(@[\w-.]+)(\/.+)?/;
const reName = /^(@?[\w/-]+)@?(.*)/;

/**
 * Generate RegExp to help determine aspects of an identifier for a project
 *
 * @param {string} projectName - Name of the project
 * @param {string} [type] - Identifier type, defaults to 'plugin'
 * @returns {{prefixed: {project: RegExp, user: RegExp}, scope: RegExp}} re
 * @private
 */
function matchMaker(projectName, type = 'plugin') {
  if (!projectName) throw new Error('projectName required.');
  return {
    prefixed: {
      project: new RegExp(`(@${projectName})/${type}-([\\w-.]+)`),
      user: new RegExp(`(@[\\w-.]+)?\\/?${projectName}-${type}-?([\\w-.]+)?`)
    }
  };
}

/**
 * Generate helpers to expand short names to long names for identifiers of a project
 *
 * @param {string} projectName - Name of the project
 * @param {string} [type] - Identifier type, defaults to 'plugin'
 * @returns {{prefixed: string}} expand
 * @private
 */
function expandMaker(projectName, type = 'plugin') {
  if (!projectName) throw new Error('projectName required.');
  const projectScope = `@${projectName}`;
  const parse = short => {
    if (reScope.test(short) && !short.includes('/')) {
      return ['', short];
    }
    return short.split('/').reverse();
  };
  return {
    prefixed: short => {
      const [name, scope] = parse(short);
      if (scope === projectScope) {
        return `${projectScope}/${type}-${name}`;
      }
      const result = `${projectName}-${type}` + (name ? `-${name}` : '');
      return scope ? `${scope}/${result}` : result;
    }
  };
}

/**
 * Create function used to make instances of PackageIdentifier for a project
 *
 * The `projectName` and `type` are components of the naming convention such as
 * - `@<projectName>/<type>-<name>`
 * - `@<user-scope>/<projectName>-<type>-<name>`
 * - `<projectName>-<type>-<name>`
 *
 * If a package belongs to the project, it should use `projectName` in its scope.
 * For user plugins, the `projectName` will be paired with the `type`.
 *
 * @param {string} projectName - Name of the project scope and base name
 * @param {string} [type] - Defaults to 'plugin'.
 * @returns {createPackageIdentifier} function to make
 */
function projectIdentifier(projectName, type = 'plugin') {

  /**
   * Setup project level variables
   * @returns {object} vars
   */
  function setupProjectVars() {
    const re = matchMaker(projectName, type);
    const expand = expandMaker(projectName, type);
    const projectScope = `@${projectName}`;
    const isScopedFn = name => reScope.test(name);
    const isShortFn = name => !(name.includes(projectName) && name.includes(type));
    const isPrefixedFn = name => re.prefixed.project.test(name) || re.prefixed.user.test(name);
    const isProjectScopedFn = name => name.startsWith(projectScope);

    return {
      re,
      expand,
      projectScope,
      isScopedFn,
      isShortFn,
      isPrefixedFn,
      isProjectScopedFn
    };
  }

  //
  // namespace project vars to avoid clutter child scopes
  //
  const projectVars = setupProjectVars();

  /**
   * Create a new PackageIdentifier instance
   *
   * @typedef {function} createPackageIdentifier
   *
   * @param {string} rawName - Original input name of a package
   * @param {object} [options] - Options
   * @param {boolean} [options.prefixed] - Set this to force prefixed format for short names
   * @returns {PackageIdentifier} instance
   */
  function createPackageIdentifier(rawName, options) {
    if (!rawName) {
      // eslint-disable-next-line max-len
      throw new Error('Package name must be supplied. See the @gasket/resolve documentation for naming conventions: https://github.com/godaddy/gasket/tree/main/packages/gasket-resolve#naming-convention');
    }

    const [, parsedName, parsedVersion] = reName.exec(rawName);

    /**
     * * Setup package level variables
     * @returns {object} vars
     */
    function setupPackageVars() {
      const short = projectVars.isShortFn(parsedName);
      const scoped = projectVars.isScopedFn(parsedName);
      const project = projectVars.isProjectScopedFn(parsedName);
      const {
        // default to prefixed for short names
        prefixed = short || projectVars.isPrefixedFn(parsedName)
      } = options || {};

      /**
       * The parts of an identifier's name format
       *
       * @typedef {object} NameFormat
       *
       * @property {boolean} prefixed
       * @property {boolean} short
       * @property {boolean} project
       * @property {boolean} scoped
       * @private
       */
      const format = Object.freeze({
        short,
        prefixed,
        scoped,
        project
      });

      const reType = project && 'project' || 'user';
      const expand = projectVars.expand.prefixed;
      const re = projectVars.re.prefixed[reType];

      return { format, expand, re };
    }

    //
    // Destructure only those vars we need to use in the class
    //
    const { format, expand, re } = setupPackageVars();
    const { projectScope } = projectVars;

    /**
     * Utility class for working with package names and versions
     *
     * @type {PackageIdentifier}
     */
    class PackageIdentifier {

      /**
       * Get the package name as provided to the identifier
       *
       * @returns {string} rawName
       */
      get rawName() {
        return rawName;
      }

      /**
       * Get the long package name
       *
       * Examples:
       * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
       * - @gasket/https -> @gasket/plugin-https
       * - @user/https -> @user/gasket-plugin-https
       * - https -> gasket-plugin-https
       *
       * @returns {string} fullName
       */
      get fullName() {
        if (format.short) {
          return expand(parsedName);
        }

        return parsedName;
      }

      /**
       * Alias to this.fullName
       *
       * @returns {string} fullName
       */
      get longName() {
        return this.fullName;
      }

      /**
       * Get the short package name
       *
       * Examples:
       * - @gasket/plugin-https -> @gasket/https
       * - @user/gasket-plugin-https -> @user/https
       * - gasket-plugin-https@1.2.3 -> https
       *
       * @returns {string} fullName
       */
      get shortName() {
        if (format.short) {
          return parsedName;
        }

        const [, scope, name] = re.exec(parsedName);
        if (name) return scope ? `${scope}/${name}` : name;
        return scope;
      }

      /**
       * Get only the package name
       *
       * Examples:
       * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
       * - https@1.2.3 -> https
       *
       * @returns {string} fullName
       */
      get name() {
        return parsedName;
      }

      /**
       * Get only the package version
       *
       * Examples:
       * - @gasket/plugin-https@1.2.3 -> 1.2.3
       * - @gasket/plugin-https -> ''
       *
       * @returns {string|null} fullName
       */
      get version() {
        return parsedVersion || null;
      }

      /**
       * Get the full package name with version
       *
       * Examples:
       * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
       * - https@1.2.3 -> @gasket/plugin-https@1.2.3
       *
       * @returns {string} fullName
       */
      get full() {
        const name = this.fullName;
        const version = this.version;
        return name + (version ? `@${version}` : '');
      }

      get isShort() {
        return format.short;
      }

      get isLong() {
        return !format.short;
      }

      get isPrefixed() {
        return format.prefixed;
      }

      get hasScope() {
        return format.scoped;
      }

      get hasProjectScope() {
        return format.project;
      }

      get hasVersion() {
        return Boolean(parsedVersion);
      }

      /**
       * Returns new PackageIdentifier with version added to desc if missing
       *
       * Examples:
       * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
       * - @gasket/plugin-https -> @gasket/plugin-https@latest
       *
       * @param {string} [defaultVersion] - the version name to add if missing
       * @returns {PackageIdentifier} identifier
       */
      withVersion(defaultVersion = 'latest') {
        const nextName = parsedName + '@' + (parsedVersion || defaultVersion);
        return createPackageIdentifier(nextName, format);
      }

      /**
       * If the rawName is a short name, get a new identifier, cycling through
       * formats which can be used to attempt to resolve packages by different
       * name pattern.
       *
       * Examples:
       * - example -> gasket-plugin-example > example-gasket-plugin > @gasket/plugin-example > @gasket/example-plugin
       * - @gasket/example -> @gasket/plugin-example > @gasket/example-plugin
       * - @user/example -> @user/gasket-plugin-example > @user/example-gasket-plugin
       *
       * @returns {PackageIdentifier|null} identifier
       */
      nextFormat() {
        if (!format.short) return null;

        let nextRawName = this.rawName;

        const nextOptions = {};
        // If we don't have a scope, force to project scope and prefixed
        if (!format.scoped) {
          nextRawName = `${projectScope}/${nextRawName}`;
          nextOptions.prefixed = true;
        }

        //
        // if there is nothing to change, return null
        //
        if (!('prefixed' in nextOptions) && nextRawName === this.rawName) {
          return null;
        }

        return createPackageIdentifier(nextRawName, nextOptions);
      }
    }

    /**
     * Output the original raw name for string concatenation.
     *
     * @returns {string} string
     */
    PackageIdentifier.prototype.toString = function toString() {
      return rawName;
    };

    return new PackageIdentifier();
  }

  /**
   * Static util method to check if a full name is valid
   *
   * Examples:
   * - @gasket/plugin-https -> true
   * - @gasket/plugin-https@1.2.3 -> false
   * - https -> false
   *
   * @function createPackageIdentifier.isValidFullName
   * @param {string} maybeFullName - Name to check
   * @returns {boolean} fullName
   */
  createPackageIdentifier.isValidFullName = function isValidFullName(maybeFullName) {
    try {
      return createPackageIdentifier(maybeFullName).fullName === maybeFullName;
    } catch (e) {
      return false;
    }
  };

  /**
   * Static util method to loop through format options for short names.
   * The handler will be provide the next formatted identifier to try,
   * which should return falsy to continue,
   * or return truthy to end and return the current identifier.
   * If the lookup runs out of formats to try, it will return null.
   *
   * @function createPackageIdentifier.lookup
   * @param {string} name - Name to check
   * @param {function(PackageIdentifier)} handler - Attempt to find package current format
   * @returns {PackageIdentifier|null} identifier if found or null
   */
  createPackageIdentifier.lookup = function lookup(name, handler) {
    let result;
    let identifier;
    do {
      identifier = identifier ? identifier.nextFormat() : createPackageIdentifier(name);
      result = identifier && handler(identifier);
    } while (!result && identifier);

    return identifier;
  };

  return createPackageIdentifier;
}

module.exports = {
  matchMaker,
  expandMaker,
  projectIdentifier
};
