/**
 * Log instance that tracks fluentd connections and sets up a winston logger.
 *
 * @class Log
 * @public
 */
export default class Log {
    /**
     * @constructor
     * @param {object} [options] - Options
     * @param {string} [options.level] - Default level to use
     * @param {boolean} [options.silent] - Should logs be silenced
     * @param {boolean} [options.local] - Is this for the local development
     * @param {string} [options.prefix] - Message prefix to use
     */
    constructor(options?: {
        level?: string;
        silent?: boolean;
        local?: boolean;
        prefix?: string;
    });
    /** @private */
    private options;
    /** @private */
    private local;
    /** @private */
    private silent;
    /** @private */
    private level;
    /**
     * Get the prefix
     * @returns {string} prefix
     * @private
     */
    private get prefix();
    /**
     * Combine log formatters based on environment.
     *
     * @returns {Object} Combined formats.
     * @private
     */
    private format;
    /**
     * Return winston transports based on environment.
     *
     * @returns {Array} transports
     * @private
     */
    private transports;
    /**
     * Return the configured levels
     *
     * @returns {Object.<string,number>} levels
     * @private
     */
    private get levels();
    /**
     * Proxy to winston.log using the predefined level.
     *
     * @param {*} args Info to log and any optional metadata.
     * @returns {Log} fluent interface.
     * @public
     */
    public log(...args: any): void;

    /**
     * Dynamically created methods properties for each level name.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    [x: string]: (...args: any) => void;

    /**
     * Wait for the 'finish' event to be emitted from the Writable
     * stream (i.e the winston logger). This will allow all underlying
     * Transports to gracefully close any open resources.
     *
     * @returns {Promise} Resolve on connection close.
     * @public
     */
    public close(): Promise<any>;

    static levels: {
        [x: string]: number;
        emerg: number;
        alert: number;
        crit: number;
        error: number;
        warning: number;
        notice: number;
        info: number;
        debug: number;
    };

    /**
     * Ensure all the expected levels utilized by Gasket plugins are set
     *
     * @param {Object.<string,number>} levels - Levels to check
     */
    static ensureMinimalLevels: (levels: {
        [x: string]: number;
    }) => void;
}
