import type { GasketConfig } from '@gasket/engine';

/**
 * Wrapper class for executing commands for a given package manager
 */
export interface PackageManager {
  /**
   * Executes npm in the application directory `this.dest`.
   * This installation can be run multiple times.
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
   * Executes npm install in the application directory `this.dest`.
   * This installation can be run multiple times.
   *
   * @param args Additional CLI arguments to pass to `npm`.
   * @public
   */
  install(args?: Array<string>): Promise<void>

  /**
   * Executes yarn or npm info, and returns parsed JSON data results.
   *
   * @param args Additional CLI arguments to pass to `npm`.
   * @returns stdout and data
   * @public
   */
  info(args?: Array<string>): Promise<{ data: any, stdout: string }>;
}

export function tryRequire(path: string): object|null;

/**
 * Normalize the config by applying any overrides for environments, commands,
 * or local-only config file.
 *
 * @param config - Target config to be normalized
 * @param context - Context for applying overrides
 * @param context.env - Name of environment
 * @param [context.commandId] - Name of command
 * @param [context.root] - Project root; required if using localeFile
 * @param [context.localFile] - Optional file to load relative to gasket root
 * @returns config
 */
export function applyConfigOverrides(config: GasketConfig, { env, commandId, root, localFile }: {
  env: string;
  commandId?: string;
  root?: string;
  localFile?: string;
}): GasketConfig;

/**
 * Normalize the config by applying any environment or local overrides
 *
 * @param gasketConfig - Gasket config
 * @param config - Target config to be normalized
 * @param [localFile] - Optional file to load relative to gasket root
 * @returns config
 * @deprecated use applyConfigOverrides
 */
declare function applyEnvironmentOverrides(gasketConfig: GasketConfig, config: GasketConfig, localFile?: string): object;

/**
 * Promise friendly wrapper to running a shell command (eg: git, npm, ls)
 * which passes back any { stdout, stderr } to the error thrown.
 *
 * Options can be passed to the underlying spawn. An additional `signal` option
 * can be passed to use AbortController, allowing processes to be killed when
 * no longer needed.
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
 *
 * @param cmd - Binary that is run
 * @param [argv] - Arguments passed to npm binary through spawn.
 * @param [options] options passed to npm binary through spawn
 * @param [options.signal] AbortControl signal allowing process to be canceled
 * @param [debug] When present pipes std{out,err} to process.*
 * @returns results
 */
export function runShellCommand(cmd: string, argv?: string[], options?: {
  signal?: object;
}, debug?: boolean): Promise<{ stdout: string }>;
