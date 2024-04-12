import type { MaybeAsync } from '@gasket/engine';
import type { Command } from 'commander';

/**
 * https://godaddy-corp.atlassian.net/browse/PFX-572
 * TODO: Determine is these types should
 * be in create-gasket-app or gasket-cli
 */
export interface Config {
  /* Commander instance */
  bin: Command;

  /* Root directory of the CLI */
  root: string;

  /* CLI Options */
  options: Record<string, any>;
  [key: string]: any;
}

export interface GasketCommandDefinition {
  /* Command id/name */
  id: string;

  /* Command description */
  description: string;

  /* Command arguments */
  args?: Array<GasketArgDefinition>;

  /* Command options */
  options?: Array<GasketOptionDefinition>;

  /* Command action handler */
  action: (...args: any[]) => MaybeAsync<void>;

  /* Hide from help output */
  hidden?: boolean;

  /* Default command to run if no command is provided */
  default?: boolean;
}

export interface GasketCommand {
  command: Command;
  hidden: boolean;
  isDefault: boolean;
}

// Default cannot be used when required is true
export type GasketArgDefinition = {
  /* Argument name */
  name: string;

  /* Argument description */
  description: string;

  /* Is the argument required */
  required?: true;

  /* Default value for the argument - never if required is true*/
  default?: never;
} | {
  name: string;
  description: string;
  required?: false;
  default?: any;
};

export type GasketCommandArg = Array<string | boolean>;

export interface GasketOptionDefinition {
  /* Long option name */
  name: string;

  /* Option description */
  description: string;

  /* Is the option required */
  required?: boolean;

  /* Short option name */
  short?: string;

  /* Function to parse the option value */
  parse?: (value: string) => any;

  /* Default is always string - boolean changes the format of the option */
  type?: 'string' | 'boolean';

  /* list of option names that cannot be used together */
  conflicts?: Array<string>;

  /* Hide from command help output */
  hidden?: boolean;

  /* Default option value */
  default?: any;
}

export interface GasketCommandOption {
  options: Array<string>;
  conflicts: Array<string>;
  hidden: boolean;
  defaultValue: any | undefined;
  parse: (value: string) => any | undefined;
  required: boolean;
}

declare module '@gasket/engine' {
  export interface HookExecTypes {
    commandOptions(config: Config): MaybeAsync<Array<GasketOptionDefinition> | GasketOptionDefinition>;

    commands(config: Config): MaybeAsync<Array<GasketCommandDefinition> | GasketCommandDefinition>;
  }
}
