// This file is exported by the package and can be imported directly.

interface ConfigContext {
  /** Name of environment */
  env: string;
  /** Name of command */
  commandId?: string;
}

// TODO: switch @gasket/core to re-exporting this type once this change is
// published and we can update its dependency to this version
export type PartialRecursive<T> = T extends Object
  ? { [K in keyof T]?: PartialRecursive<T[K]> } | undefined
  : T | undefined;

type ConfigDefinition<T> = T & {
  environments?: Record<string, PartialRecursive<T>>;
  commands?: Record<string, PartialRecursive<T>>;
}

type ConfigPartial<T extends ConfigDefinition> = PartialRecursive<T> | undefined | void | unknown;

export function getPotentialConfigs(
  config: ConfigDefinition,
  configContext: ConfigContext
): Array<ConfigPartial>;

export function getCommandOverrides(
  commands: Record<string, PartialRecursive<ConfigDefinition>>,
  commandId: string
): Array<ConfigPartial>;

export function getSubEnvironmentOverrides(
  env: string,
  environments: Record<string, PartialRecursive<ConfigDefinition>>
): Array<ConfigPartial>;

export function getDevOverrides(
  isLocalEnv: boolean,
  environments: Record<string, PartialRecursive<ConfigDefinition>>
): Array<ConfigPartial>;

export async function getLatestVersion(
  pkgName: string,
  /** current time in milliseconds */
  currentTime: number,
  cache: Record<string, any>
): Promise<string>;

export function getLocalOverrides(
  isLocalEnv: boolean,
  root: string,
  localFile: string
): Generator<ConfigDefinition | undefined, void, unknown>;

// Normalize the config by applying any overrides for environments, commands, or
// local-only config file.
export function applyConfigOverrides<Config>(
  config: ConfigDefinition<Config>,
  configContext: ConfigContext
): Config;
