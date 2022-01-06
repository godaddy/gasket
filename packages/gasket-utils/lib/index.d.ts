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
