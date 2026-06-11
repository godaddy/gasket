import type {
  CreateContext,
  CreateCommand,
  CommandArgument,
  CommandOption,
  CreateCommandOptions
} from './index.d.ts';
import type { GasketEngine, Plugin, Gasket } from '@gasket/core';
import type { Ora } from 'ora';
import type { Command, Option } from 'commander';


export type PartialCreateContext = Partial<CreateContext>;

export function commasToArray(value: string): string[];

/** scaffold */

export function readConfig(
  context: PartialCreateContext,
  configFlags: { config?: string; configFile?: string }
): void;

export function dumpErrorContext(context: PartialCreateContext, error: Error): Promise<void>;

export function makeCreateContext(argv?: string[], options?: CreateCommandOptions): PartialCreateContext;

export function makeCreateRuntime(context: PartialCreateContext, source: Plugin): typeof Proxy<CreateContext>;

/**
 * Represents the execution context for a task.
 */
export interface SpinnerContext {
  gasket?: Gasket;
  context: PartialCreateContext;
  spinner: Ora;
}

/**
 * Task function type that runs within a spinner wrapper.
 */
export type SpinnerTask = (params: SpinnerContext) => Promise<void>;

/**
 * Options for the spinner wrapper.
 */
export interface SpinnerOptions {
  startSpinner?: boolean;
}

/**
 * Wraps a task with a spinner, handling success and failure states.
 */
export function wrapWithSpinner(
  label: string,
  task: SpinnerTask,
  options?: SpinnerOptions
): (context: { context: SpinnerContext['context'] } & {
  errors?: Error[]
}) => Promise<void>;

/**
 * Wraps a task with a spinner, using both gasket and context.
 */
export function withGasketSpinner(
  label: string,
  task: SpinnerTask,
  options?: SpinnerOptions
): (context: { gasket: any; context: SpinnerContext['context'] }) => Promise<void>;

/**
 * Wraps a task with a spinner, using only context.
 */
export function withSpinner(
  label: string,
  task: SpinnerTask,
  options?: SpinnerOptions
): (context: { context: SpinnerContext['context'] }) => Promise<void>;

export function spinnerAction(params: {
  gasket?: GasketEngine;
  context: PartialCreateContext;
  spinner?: Ora
}): Promise<void>;

export function execute(params: { gasket: Gasket, context: PartialCreateContext } & {
  errors?: Error[]
}): Promise<void>;

/** scaffold/actions */

export function mkDir({ context, spinner }: { context: CreateContext, spinner: Ora }): Promise<void>;

/** Templates */
export function loadTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function copyTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function customizeTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function installTemplateDeps(params: { context: PartialCreateContext }): Promise<void>;
export function gitInit(params: { context: PartialCreateContext }): Promise<void>;

export function printReport(params: {
  context: PartialCreateContext
}): Promise<void>;
export function buildReport(context: PartialCreateContext): {
  appName?: string;
  output?: string;
  generatedFiles?: string[];
  messages?: string[];
  warnings?: string[];
  errors?: string[];
  nextSteps?: string[];
}

/** utils */

export function processCommand(command: CreateCommand): { command: Command, hidden: boolean, isDefault: boolean };
export function isValidCommand(command: CreateCommand): boolean;

export function processArgs(args: CommandArgument[]): [string, string?, any?][];
export function isValidArg(arg: CommandArgument): boolean;

interface OptionDefinition {
  options: [string, string];
  conflicts: CommandOption['conflicts'];
  hidden: CommandOption['hidden'];
  required: CommandOption['required'];
  defaultValue: CommandOption['default'];
  parse: CommandOption['parse']
}
export function isValidOption(option: CommandOption): boolean;
export function processOptions(options: CommandOption[]): OptionDefinition[];
export function createOption(definition: OptionDefinition): Option;
