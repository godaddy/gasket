import type { MaybeAsync } from '@gasket/core';
import type { SpawnOptions } from 'child_process';

export interface PackageManagerOptions {
  /** Name of manager, either `npm` (default) or `yarn` */
  packageManager?: string;
  /** Target directory where `node_module` should exist */
  dest?: string;
}

/**
 * Wrapper class for executing commands for a given package manager
 */
export class PackageManager {
  constructor(options: PackageManagerOptions): void;

  /** Name of manager, either `npm` (default) or `yarn` */
  manager: string;
  /** Target directory where `node_module` should exist */
  dest: string;

  /**
   * Executes npm in the application directory `this.dest`. This installation
   * can be run multiple times.
   * @param cmd The command that needs to be executed.
   * @param args Additional CLI arguments to pass to `npm`.
   */
  exec(cmd: string, args?: Array<string>): Promise<void>;

  /**
   * Executes npm link in the application directory `this.dest`.
   * @param packages Explicit `npm` packages to link locally.
   */
  link(packages?: Array<string>): Promise<void>;

  /**
   * Executes npm install in the application directory `this.dest`. This
   * installation can be run multiple times.
   * @param args Additional CLI arguments to pass to `npm`.
   * @public
   */
  install(args?: Array<string>): Promise<void>;

  /**
   * Executes yarn or npm info, and returns parsed JSON data results.
   * @param args Additional CLI arguments to pass to `npm`.
   * @returns stdout and data
   * @public
   */
  info(args?: Array<string>): Promise<{ data: any; stdout: string }>;
}

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
 * @param cmd
 * @param argv
 * @param options
 * @param options.signal
 * @param options.cwd
 * @param debug
 * @example
 * const { runShellCommand } = require('@gasket/utils');
 *
 *  async function helloWorld() {
 *   await runShellCommand('echo', ['hello world']);
 * }
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
  options?: SpawnOptions,
  /** When present pipes std{out,err} to process.*/
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
/**
 * Executes the appropriate npm binary with the verbatim `argv` and
 * `spawnWith` options provided. Passes appropriate debug flag for
 * npm based on process.env.
 * @param argv
 * @param spawnWith
 */
export function PackageManager_spawnNpm(
  /** Precise CLI arguments to pass to `npm`. */
  argv: string[],
  /** Options for child_process.spawn. */
  spawnWith: SpawnOptions
): Promise<{ stdout: string }>;

/**
 * Executes the appropriate yarn binary with the verbatim `argv` and
 * `spawnWith` options provided. Passes appropriate debug flag for
 * npm based on process.env.
 * @param argv
 * @param spawnWith
 */
export function PackageManager_spawnYarn(
  /** Precise CLI arguments to pass to `npm`. */
  argv: string[],
  /** Options for child_process.spawn. */
  spawnWith: SpawnOptions
): Promise<{ stdout: string }>;

export function PackageManager_exec(
  /** The command that needs to be executed. */
  cmd: string,
  /** Additional CLI arguments to pass to `npm`. */
  args: string[]
): Promise<{ stdout: string }>;

export function PackageManager_link(
  /** Explicit `npm` packages to link locally. */
  packages: string[]
): Promise<{ stdout: string }>;

export function PackageManager_install(
  /** Additional CLI arguments to pass to `npm`. */
  args: string[]
): Promise<{ stdout: string }>;

export function PackageManager_info(
  /** Additional CLI arguments to pass to `npm`. */
  args: string[]
): Promise<{ data: any; stdout: string }>;

export function warnIfOutdated(pkgName: string, currentVersion: string): MaybeAsync<void>;

export function getPackageLatestVersion(pkgName: string, options?: object): Promise<string>;

// TODO: switch @gasket/core to re-exporting this type once this change is
// published and we can update its dependency to this version
export type PartialRecursive<T> = T extends object
  ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
  : T | undefined;

export type ConfigDefinition<T = any> = T & {
  environments?: Record<string, PartialRecursive<T>>;
  commands?: Record<string, PartialRecursive<T>>;
};

type ConfigPartial<T> = PartialRecursive<T> | undefined | void | unknown;

export function getPotentialConfigs<T>(
  config: ConfigDefinition<T>,
  configContext: ConfigContext
): Array<ConfigPartial<T>>;

export function getCommandOverrides<T>(
  commands: Record<string, PartialRecursive<T>>,
  commandId: string
): Array<ConfigPartial<T>>;

export function getSubEnvironmentOverrides<T>(
  env: string,
  environments: Record<string, PartialRecursive<T>>
): Array<ConfigPartial<T>>;

export function getDevOverrides<T>(
  isLocalEnv: boolean,
  environments: Record<string, PartialRecursive<T>>
): Array<ConfigPartial<T>>;

export function getLatestVersion(
  pkgName: string,
  /** current time in milliseconds */
  currentTime: number,
  cache: Record<string, any>
): Promise<string>;

export function getLocalOverrides<T>(
  isLocalEnv: boolean,
  root: string,
  localFile: string
): Generator<ConfigDefinition<T> | undefined, void, unknown>;

// Normalize the config by applying any overrides for environments, commands, or local-only config file.
export function applyConfigOverrides<T>(
  config: ConfigDefinition<T>,
  configContext: ConfigContext
): T;

declare module 'diagnostics' {
  const diagnostics: (namespace: string) => (...args: any[]) => void;
  export = diagnostics;
}
