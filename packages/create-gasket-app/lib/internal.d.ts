import type {
  CreateContext,
  CreatePrompt,
  ConfigBuilder,
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

/** sacaffold/actions */

export function createHooks(params: { gasket?: Gasket; context: PartialCreateContext }): Promise<void>;

export function chooseAppDescription(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function choosePackageManager(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function chooseTestPlugins(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function promptForTestPlugin(
  prompt: CreatePrompt,
  message: string,
  isDefault: boolean
): Promise<string | null>;
export function allowExtantOverwriting(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function globalPrompts(params: { context: PartialCreateContext }): Promise<void>;

export function promptHooks(params: { gasket?: Gasket; context: PartialCreateContext }): Promise<void>;
export function execPluginPrompts(gasket: Gasket, context: PartialCreateContext): Promise<void>;

export function mkDir({ context, spinner }: { context: CreateContext, spinner: Ora }): Promise<void>;

export function setupPkg(params: { context: PartialCreateContext }): Promise<void>;

export function writePkg(params: { context: PartialCreateContext }): Promise<void>;

export type Descriptior = {
  pattern: string;
  base: string;
  srcFile: string;
  targetFile: string;
  target: string;
  from: string;
  overrides?: string;
}

/** Templates */
export function loadTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function copyTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function customizeTemplate(params: { context: PartialCreateContext }): Promise<void>;
export function installTemplateDeps(params: { context: PartialCreateContext }): Promise<void>;
export function gitInit(params: { context: PartialCreateContext }): Promise<void>;

/** File Generation */
export function generateFiles({ context, spinner }: { context: CreateContext, spinner: Ora }): Promise<void>;
export function performGenerate(context: CreateContext, descriptors: Descriptior[]): boolean[];
export function getDescriptors(context: CreateContext): Promise<Descriptior[]>;
export function assembleDescriptors(dest: string, from: string, pattern: string, srcPaths: string[]): Descriptior[];
export function reduceDescriptors(descriptors: Descriptior[]): Descriptior[];

export function writeGasketConfig(params: { context: PartialCreateContext }): Promise<void>;
export function writeImports(imports: object | null): string;
export function writeExpressions(expressions: string[] | null): string;
export function createInjectionAssignments(config: object, assignments: (object | null)): string;
export function cleanupFields(config: ConfigBuilder<object>): void;
export function writePluginImports(plugins: string[]): string;
export function replaceInjectionAssignments(content: string, assignments: (object | null)): string;

export function installModules(params: { context: PartialCreateContext }): Promise<void>;

export function linkModules(params: { context: CreateContext, spinner: Ora }): Promise<void>;

export function postCreateHooks(params: { gasket?: Gasket, context: PartialCreateContext }): Promise<void>;

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
