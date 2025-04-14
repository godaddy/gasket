// This file is exported by the package and can be imported directly.

interface ConfigContext {
  /** Name of environment */
  env: string;
  /** Name of command */
  commandId?: string;
}

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
