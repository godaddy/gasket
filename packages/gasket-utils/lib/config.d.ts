// This file is exported by the package and can be imported directly.

interface ConfigContext {
  /** Name of environment */
  env: string;
  /** Name of command */
  commandId?: string;
}

interface ConfigDefinition extends Record<string, any> {
  environments?: Record<string, Partial<ConfigDefinition>>;
  commands?: Record<string, Partial<ConfigDefinition>>;
  [key: string]: any;
}

type ConfigOutput = Omit<ConfigDefinition, 'environments' | 'commands'>;
type ConfigPartial = Partial<ConfigDefinition> | undefined | void | unknown;

export function getPotentialConfigs(
  config: ConfigDefinition,
  configContext: ConfigContext
): Array<ConfigPartial>;

export function getCommandOverrides(
  commands: Record<string, Partial<ConfigDefinition>>,
  commandId: string
): Array<ConfigPartial>;

export function getSubEnvironmentOverrides(
  env: string,
  environments: Record<string, Partial<ConfigDefinition>>
): Array<ConfigPartial>;

export function getDevOverrides(
  isLocalEnv: boolean,
  environments: Record<string, Partial<ConfigDefinition>>
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
export function applyConfigOverrides<
  Def extends ConfigDefinition,
  Out extends ConfigOutput
>(config: Def, configContext: ConfigContext): Out;
