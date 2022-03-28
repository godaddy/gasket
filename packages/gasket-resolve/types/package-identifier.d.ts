/**
 * Create function used to make instances of PackageIdentifier for a project
 *
 * The `projectName` and `type` are components of the naming convention such as
 * - @<projectName>/<type>-<name>
 * - @<user-scope>/<projectName>-<type>-<name>
 * - <projectName>-<type>-<name>
 *
 * If a package belongs to the project, it should use `projectName` in its scope.
 * For user plugins, the `projectName` will be paired with the `type`.
 *
 * @param {string} projectName - Name of the project scope and base name
 * @param {string} [type] - Defaults to 'plugin'.
 * @returns {createPackageIdentifier} function to make
 */
export function projectIdentifier(projectName: string, type?: string): typeof createPackageIdentifier;

/**
 * Create a new PackageIdentifier instance
 *
 * @param {string} rawName - Original input name of a package
 * @param {object} [options] - Options
 * @param {boolean} [options.prefixed] - Set this to force prefixed format for short names
 * @returns {PackageIdentifier} instance
 */
export function createPackageIdentifier(rawName: string, options?: { prefixed: boolean }): PackageIdentifier;

export interface PackageIdentifier {

    /**
     * Get the package name as provided to the identifier
     *
     * @returns {string} rawName
     */
    get rawName(): string

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
    get fullName(): string

    /**
     * Alias to this.fullName
     *
     * @returns {string} fullName
     */
    get longName(): string

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
    get shortName(): string

    /**
     * Get only the package name
     *
     * Examples:
     * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https
     * - https@1.2.3 -> https
     *
     * @returns {string} fullName
     */
    get name(): string

    /**
     * Get only the package version
     *
     * Examples:
     * - @gasket/plugin-https@1.2.3 -> 1.2.3
     * - @gasket/plugin-https -> ''
     *
     * @returns {string|null} fullName
     */
    get version(): string|null

    /**
     * Get the full package name with version
     *
     * Examples:
     * - @gasket/plugin-https@1.2.3 -> @gasket/plugin-https@1.2.3
     * - https@1.2.3 -> @gasket/plugin-https@1.2.3
     *
     * @returns {string} fullName
     */
    get full(): string

    get isShort(): string

    get isLong(): string

    get isPrefixed(): boolean

    get hasScope(): boolean

    get hasProjectScope(): boolean

    get hasVersion(): boolean

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
    withVersion(defaultVersion?: string): PackageIdentifier

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
    nextFormat(): PackageIdentifier|null

    toString(): string
}
