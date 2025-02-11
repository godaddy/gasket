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
import type ora from 'ora';
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

export function makeCreateRuntime(context: PartialCreateContext, source: Plugin): Proxy<CreateContext>;

export function spinnerAction(params: {
  gasket?: GasketEngine;
  context: PartialCreateContext;
  spinner?: ora.Ora
}): Promise<void>;
export function withSpinnerWrapper(params: { gasket: GasketEngine, context: PartialCreateContext }): Promise<void>;
export function withSpinner(
  label: string,
  fn: typeof spinnerAction,
  options?: { startSpinner?: boolean }
): typeof withSpinnerWrapper

/** sacaffold/actions */

export function createHooks(params: { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function chooseAppDescription(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function choosePackageManager(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function chooseTestPlugins(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function promptForTestPlugin(
  prompt: CreatePrompt,
  message: string,
  choices: { name: string; value: string; }[]
): Promise<string | null>;
export function allowExtantOverwriting(context: PartialCreateContext, prompt: CreatePrompt): Promise<void>;
export function globalPrompts(params: { context: PartialCreateContext }): Promise<void>;
export function loadPresets(params: { context: CreateContext }): Promise<void>;
export function presetPromptHooks(params: { gasket: GasketEngine; context: CreateContext }): Promise<void>;
export function presetConfigHooks(params: { gasket: GasketEngine; context: CreateContext }): Promise<void>;
export function promptHooks(params: { gasket: GasketEngine; context: CreateContext }): Promise<void>;
export function execPluginPrompts(gasket: GasketEngine, context: CreateContext): Promise<void>;

export function mkDir({ context, spinner }: { context: CreateContext, spinner: ora.Ora }): Promise<void>;

export function setupPkg(params: { context: CreateContext }): Promise<void>;

export function writePkg(params: { context: CreateContext }): Promise<void>;

export type Descriptior = {
  pattern: string;
  base: string;
  srcFile: string;
  targetFile: string;
  target: string;
  from: string;
  overrides?: string;
}
export function generateFiles({ context, spinner }: { context: CreateContext, spinner: ora.Ora }): Promise<void>;
export function performGenerate(context: CreateContext, descriptors: Descriptior[]): boolean[];
export function getDescriptors(context: CreateContext): Promise<Descriptior[]>;
export function assembleDescriptors(dest: string, from: string, pattern: string, srcPaths: string[]): Descriptior[];
export function reduceDescriptors(descriptors: Descriptior[]): Descriptior[];

export function writeGasketConfig(params: { context: CreateContext }): Promise<void>;
export function writeImports(imports: object | null): string;
export function writeExpressions(expressions: string[] | null): string;
export function createInjectionAssignments(config: object, assignments: (object | null)): string;
export function cleanupFields(config: ConfigBuilder): void;
export function writePluginImports(plugins: string[]): string;
export function replaceInjectionAssignments(content: string, assignments: (object | null)): string;

export function installModules(params: { context: CreateContext }): Promise<void>;

export function linkModules(params: { context: CreateContext, spinner: ora.Ora }): Promise<void>;

export function postCreateHooks(params: { gasket: GasketEngine, context: CreateContext }): Promise<void>;

export function printReport(params: {
  context: CreateContext
}): Promise<void>;
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
export function processOptions(options: CommandOption[]): OptionDefinition[];
export function createOption(definition: OptionDefinition): Option;
