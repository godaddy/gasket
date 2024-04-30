import type { GasketConfig } from '@gasket/engine';

declare module '@gasket/engine' {
  export interface GasketConfig {
    environments?: string;
    commands?: string;
  }
}

interface PackageManagerOptions {
  /** Name of manager, either `npm` (default) or `yarn` */
  packageManager: string;
  /** Target directory where `node_module` should exist */
  dest: string;
  /** @deprecated Path to userconfig */
  npmconfig?: string;
}

/**
 * Wrapper class for executing commands for a given package manager
 */
export interface PackageManager {
  constructor(options: PackageManagerOptions): void;

  /** Name of manager, either `npm` (default) or `yarn` */
  manager: string;
  /** Target directory where `node_module` should exist */
  dest: string;
  /** @deprecated Path to userconfig */
  npmconfig: string;

  /**
   * Executes npm in the application directory `this.dest`. This installation
   * can be run multiple times.
   *
   * @param cmd The command that needs to be executed.
   * @param args Additional CLI arguments to pass to `npm`.
   */
  exec(cmd: string, args?: Array<string>): Promise<void>;

  /**
   * Executes npm link in the application directory `this.dest`.
   *
   * @param packages Explicit `npm` packages to link locally.
   */
  link(packages?: Array<string>): Promise<void>;

  /**
   * Executes npm install in the application directory `this.dest`. This
   * installation can be run multiple times.
   *
   * @param args Additional CLI arguments to pass to `npm`.
   * @public
   */
  install(args?: Array<string>): Promise<void>;

  /**
   * Executes yarn or npm info, and returns parsed JSON data results.
   *
   * @param args Additional CLI arguments to pass to `npm`.
   * @returns stdout and data
   * @public
   */
  info(args?: Array<string>): Promise<{ data: any; stdout: string }>;
}

/**
 * Tries to require a module, but ignores if it is not found. If not found,
 * result will be null.
 * @example
 * const { tryRequire } = require('@gasket/utils');
 *
 *  let someConfig = tryRequire('../might/be/a/path/to/some/file');
 *
 *  if(!someConfig) {
 *   someConfig = require('./default-config')
 * }
 */
export function tryRequire(path: string): object | null;

interface ConfigContext {
  /** Name of environment */
  env: string;
  /** Name of command */
  commandId?: string;
  /** Project root; required if using localeFile */
  root?: string;
  /** Optional file to load relative to gasket root */
  localFile?: string;
}

/**
 * Normalize the config by applying any overrides for environments, commands, or local-only config file.
 */
export function applyConfigOverrides(
  config: GasketConfig,
  configContext: ConfigContext
): GasketConfig;

export function getPotentialConfigs(
  config: ConfigContext & {
    config: GasketConfig;
  }
): Generator<any, any, any>;

/**
 * Normalize the config by applying any environment or local overrides
 *
 * @param gasketConfig - Gasket config
 * @param config - Target config to be normalized
 * @param [localFile] - Optional file to load relative to gasket root
 * @returns config
 * @deprecated use applyConfigOverrides
 */
declare function applyEnvironmentOverrides(
  gasketConfig: GasketConfig,
  config: GasketConfig,
  localFile?: string
): object;

export interface Signal {
  aborted?: boolean;
  addEventListener(type: 'abort', listener: () => void): void;
}

/**
 * Promise friendly wrapper to running a shell command (eg: git, npm, ls) which
 * passes back any { stdout, stderr } to the error thrown.
 *
 * Options can be passed to the underlying spawn. An additional `signal` option
 * can be passed to use AbortController, allowing processes to be killed when no
 * longer needed.
 *
 * @example
 * const { runShellCommand } = require('@gasket/utils');
 *
 *  async function helloWorld() {
 *   await runShellCommand('echo', ['hello world']);
 * }
 *
 * @example
 * // With timeout using AbortController
 *
 * const { runShellCommand } = require('@gasket/utils');
 * const AbortController = require('abort-controller');
 *
 *  async function helloWorld() {
 *   const controller = new AbortController();
 *   // abort the process after 60 seconds
 *   const id = setTimeout(() => controller.abort(), 60000);
 *   await runShellCommand('long-process', ['something'], { signal: controller.signal });
 *   clearTimeout(id);
 * }
 */
export function runShellCommand(
  /** Binary that is run */
  cmd: string,
  /** Arguments passed to npm binary through spawn. */
  argv?: string[],
  /** Options passed to npm binary through spawn */
  options?: {
    /** AbortControl signal allowing process to be canceled */
    signal?: Signal;
    /** Path to the target app (Default: cwd/appName) */
    cwd?: string;
  },
  /** When present pipes std{out,err} to process.* */
  debug?: boolean
): Promise<{ stdout: string }>;

export interface PkgManager {
  pkgManager: string;
  cmd: string;
  flags: string[];
  logMsg: (msg: string) => string;
}

export interface TargetConfig {
  environments: string;
}

export interface environments {
  dev;
}

export interface ConfigContext {
  /** Name of environment */
  env: string;
  /** Name of command */
  commandId?: string;
  /** Project root; required if using localeFile */
  root?: string;
  /** Optional file to load relative to gasket root */
  localFile?: string;
}
