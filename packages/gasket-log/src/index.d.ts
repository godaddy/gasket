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
     * @param {boolean} [options.prod] - Force logs in production mode
     */
    constructor(options?: {
        level?: string;
        silent?: boolean;
        local?: boolean;
        prefix?: string;
        prod?: boolean;
    });

    public log(...args: any): void;
    /**
     * Emergency level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public emerg(...args: any): void;
    /**
     * Alert level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public alert(...args: any): void;
    /**
     * Critical level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public crit(...args: any): void;
    /**
     * Error level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public error(...args: any): void;
    /**
     * Warning level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public warning(...args: any): void;
    /**
     * Notice level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public notice(...args: any): void;
    /**
     * Info level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public info(...args: any): void;
    /**
     * Debug level logging.
     *
     * @param {*} args Info to log and any optional metadata.
     * @public
     */
    public debug(...args: any): void;
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
