/**
 * Utility to help resolve and require modules
 *
 * @type {Resolver}
 */
export class Resolver {
    /**
     * @param {object} options - Options
     * @param {string|string[]} [options.resolveFrom] - Path(s) to resolve modules from
     * @param {require} [options.require] - Require instance to use
     */
    constructor(options: {
        resolveFrom?: string | string[];
        require?: Function;
    });

    /**
     * Returns the resolved module filename
     *
     * @param {string} moduleName name of the module
     * @returns {string} filename of the module
     */
    resolve(moduleName: string): string;
    /**
     * Returns the required module
     *
     * @param {string} moduleName name of the module
     * @returns {object} module contents
     */
    require(moduleName: string): object;
    /**
     * Returns the resolved module filename, or null if not found
     *
     * @param {string} moduleName name of the module
     * @returns {string|null} filename of the module
     */
    tryResolve(moduleName: string): string | null;
    /**
     * Returns the required module, or null if not found
     *
     * @param {string} moduleName name of the module
     * @returns {object|null} module contents
     */
    tryRequire(moduleName: string): object | null;
}
