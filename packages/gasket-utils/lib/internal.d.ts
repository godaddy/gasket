import { ConfigDefinition } from './index';

function getCommandOverrides(
  commands: Record<string, Partial<ConfigDefinition>>,
  commandId: string
): Generator<ConfigDefinition | undefined, void, unknown>;

function getSubEnvironmentOverrides(
  env: string,
  environments: Record<string, Partial<ConfigDefinition>>
): Generator<ConfigDefinition | undefined, void, unknown>;

function getDevOverrides(
  isLocalEnv: boolean,
  environments: Record<string, Partial<ConfigDefinition>>
): Generator<ConfigDefinition | undefined, void, unknown>;

async function getLatestVersion(
  pkgName: string,
  /** current time in milliseconds */
  currentTime: number,
  cache: Record<string, any>
): Promise<string>;

function getLocalOverrides(
  isLocalEnv: boolean,
  root: string,
  localFile: string
): Generator<ConfigDefinition | undefined, void, unknown>;
