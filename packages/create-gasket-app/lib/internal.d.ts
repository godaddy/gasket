import type {
  CreateContext,
  CreatePrompt,
  ConfigBuilder,
  CreateCommand,
  CommandArgument,
  CommandOption,
  CreateCommandOptions
} from 'create-gasket-app';
import type { GasketEngine, Plugin } from '@gasket/core';
import type { Ora } from 'ora';
import type { Command, Option } from 'commander';

export function commasToArray(value: string): string[];

/** scaffold */

export function readConfig(
  context: Partial<CreateContext>,
  configFlags: { config?: string; configFile?: string }
): void;

export function dumpErrorContext(context: Partial<CreateContext>, error: Error): Promise<void>;

export function makeCreateContext(argv?: string[], options?: CreateCommandOptions): Partial<CreateContext>;

export function makeCreateRuntime(context: Partial<CreateContext>, source: Plugin): Proxy<CreateContext>;

export function spinnerAction(param: {
  gasket?: GasketEngine;
  context: Partial<CreateContext>;
  spinner?: Ora
}): Promise<void>;

export function withSpinnerWrapper(param: { gasket?: GasketEngine, context: Partial<CreateContext> }): Promise<void>;

export function withSpinner(
  label: string,
  fn: typeof spinnerAction,
  options?: { startSpinner?: boolean }
): typeof withSpinnerWrapper

/** sacaffold/actions */

export function createHooks(param: { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function chooseAppDescription(context: Partial<CreateContext>, prompt: CreatePrompt): Promise<void>;
export function choosePackageManager(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function chooseTestPlugins(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function allowExtantOverwriting(context: CreateContext, prompt: CreatePrompt): Promise<void>;

export function promptForTestPlugin(
  prompt: CreatePrompt,
  message: string,
  choices: { name: string; value: string; }[]
): Promise<string | null>;
export function globalPrompts(param: { context: Partial<CreateContext> }): Promise<void>;

export function loadPresets(param: { context: CreateContext }): Promise<void>;

export function presetPromptHooks(param: { gasket: GasketEngine, context: Partial<CreateContext> }): Promise<void>;

export function presetConfigHooks(param: { gasket: GasketEngine, context: Partial<CreateContext> }): Promise<void>;

export function promptHooks(param: { gasket: GasketEngine, context: CreateContext }): Promise<void>;
export function execPluginPrompts(gasket: GasketEngine, context: CreateContext): Promise<void>;

export function mkDir(param: { context: CreateContext, spinner: Ora }): Promise<void>;

export function setupPkg(param: { context: CreateContext }): Promise<void>;

export function writePkg(param: { context: CreateContext }): Promise<void>;

export type Descriptior = {
  pattern: string;
  base: string;
  srcFile: string;
  targetFile: string;
  target: string;
  from: string;
  overrides?: string;
}
export function generateFiles(param: { context: CreateContext, spinner: Ora }): Promise<void>;
export function performGenerate(context: CreateContext, descriptors: Descriptior[]): boolean[];
export function getDescriptors(context: CreateContext): Promise<Descriptior[]>;
export function assembleDescriptors(dest: string, from: string, pattern: string, srcPaths: string[]): Descriptior[];
export function reduceDescriptors(descriptors: Descriptior[]): Descriptior[];

export function writeGasketConfig(param: { context: CreateContext }): Promise<void>;
export function writeImports(imports: object | null): string;
export function writeExpressions(expressions: string[] | null): string;
export function createInjectionAssignments(config: object, assignments: (object | null)): string;
export function cleanupFields(config: ConfigBuilder): void;
export function writePluginImports(plugins: string[]): string;
export function replaceInjectionAssignments(content: string, assignments: (object | null)): string;

export function installModules(param: { context: CreateContext }): Promise<void>;

export function linkModules(param: { context: CreateContext, spinner?: Ora }): Promise<void>;

export function postCreateHooks(param: { gasket: GasketEngine, context: CreateContext }): Promise<void>;

export function printReport(param: { context: CreateContext }): Promise<void>;
export function buildReport(context: CreateContext): {
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
export function processOptions(options: CommandOption[]): OptionDefinition[]

export function createOption(definition: OptionDefinition): Option
