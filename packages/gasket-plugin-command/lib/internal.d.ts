import type { Hook } from '@gasket/core';
import type { Command, Option } from 'commander';
import type { GasketCommandDefinition } from './index.d.ts';

/* Processed Option */
interface GasketCommandOption {
  options: ConstructorParameters<typeof Option>;
  conflicts: Array<string>;
  hidden: boolean;
  defaultValue: any | undefined;
  parse: (value: string) => any | undefined;
  required: boolean;
}

export function createOption(definition: GasketCommandOption): Option;

// Default cannot be used when required is true
type GasketArgDefinition =
  | {
      /* Argument name */
      name: string;

      /* Argument description */
      description: string;

      /* Is the argument required */
      required?: true;

      /* Default value for the argument - never if required is true*/
      default?: never;
    }
  | {
      name: string;
      description: string;
      required?: false;
      default?: any;
    };

export function isValidArg(arg: GasketArgDefinition): boolean;

type GasketCommandArg = Parameters<Command['argument']>;

export function processArgs(args: GasketArgDefinition[]): GasketCommandArg[];

export function isValidCommand(command: GasketCommandDefinition): boolean;

interface GasketCommand {
  command: Command;
  hidden: boolean;
  isDefault: boolean;
}

interface GasketOptionDefinition {
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

type CommandsHook = Hook<'commands'>;

export function processCommand(command: GasketCommandDefinition): GasketCommand;

export function isValidOption(option: GasketOptionDefinition): boolean;

export function processOptions(
  options: GasketOptionDefinition[]
): GasketCommandOption[];
