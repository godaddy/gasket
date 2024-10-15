import { Gasket } from '@gasket/core';
import type { CreateContext, CreatePrompt, ConfigBuilder } from './index';
import type { GasketEngine } from '@gasket/core';
import ora = require('ora');

/** scaffold */

export function readConfig(
  context: CreateContext,
  configFlags: { config?: string; configFile?: string }
): void;

export function dumpErrorContext(context: CreateContext, error: Error): Promise<void>;


export function spinnerAction({ gasket, context, spinner } : {
  gasket?: GasketEngine;
  context?: CreateContext;
  spinner?: ora.Ora
}): Promise<void>;
export function withSpinnerWrapper({ gasket, context } : { gasket: GasketEngine, context: CreateContext }): Promise<void>; 
export function withSpinner(
  label: string,
  fn: spinnerAction,
  options?: { startSpinner?: boolean }
): withSpinnerWrapper

/** sacaffold/actions */

export function createHooks({ gasket, context } : { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function chooseAppDescription(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function choosePackageManager(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function chooseTestPlugins(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function promptForTestPlugin(
  prompt: CreatePrompt, 
  message: string, 
  choices: { name: string; value: string; }[]
): Promise<string | null>;
export function allowExtantOverwriting(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function globalPrompts({ context } : { context: CreateContext }): Promise<void>;

export function loadPresets({ context } : { context: CreateContext }): Promise<void>;

export function presetPromptHooks({ gasket, context }: { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function presetConfigHooks({ gasket, context }: { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function promptHooks({ gasket, context }: { gasket: GasketEngine; context: CreateContext }): Promise<void>;
export function execPluginPrompts(gasket: GasketEngine, context: CreateContext): Promise<void>;

export function mkDir({ context, spinner }: { context: CreateContext, spinner: ora.Ora }): Promise<void>;

export function setupPkg({ context }: { context: CreateContext }): Promise<void>;

export function writePkg({ context }: { context: CreateContext }): Promise<void>;

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
export function assembleDescriptors(dest: string, from: string, pattern: string, srcPaths: sring[]): Descriptior[];
export function reduceDescriptors(descriptors: Descriptior[]): Descriptior[];

export function writeGasketConfig({ context }: { context: CreateContext }): Promise<void>;
export function writeImports(imports: object | null): string;
export function writeExpressions(expressions: string[] | null): string;
export function createInjectionAssignments(config: object, assignments: (object | null)): string;
export function cleanupFields(config: ConfigBuilder): void;
export function writePluginImports(plugins: string[]): string;
export function replaceInjectionAssignments(content: string, assignments: (object | null)): string;

export function installModules({ context }: { context: CreateContext }): Promise<void>;

export function linkModules({context, spinner}: { context: CreateContext, spinner: ora.Ora }): Promise<void>;

export function postCreateHooks({ gasket, context }: { gasket: GasketEngine, context: CreateContext }): Promise<void>;

export function printReport({ context }: { context: CreateContext }): Promise<void>;
export function buildReport(context: CreateContext): {
  appName?: string;
  output?: string;
  generatedFiles?: string[];
  messages?: string[];
  warnings?: string[];
  errors?: string[];
  nextSteps?: string[];
}
