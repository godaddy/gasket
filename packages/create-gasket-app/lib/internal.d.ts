import { Gasket } from '@gasket/core';
import type { CreateContext, CreatePrompt } from './index';
import type { GasketEngine } from '@gasket/core';
import ora = require('ora');

/** scaffold */

export function readConfig(
  context: CreateContext,
  configFlags: { config?: string; configFile?: string }
): void;

export function dumpErrorContext(context: CreateContext, error: Error): Promise<void>;


export function spinnerAction(params: {
  gasket?: GasketEngine;
  context?: CreateContext;
  spinner?: ora.Ora
}): Promise<void>;
export function withSpinnerWrapper(params: { gasket: GasketEngine, context: CreateContext }): Promise<void>; 
export function withSpinner(
  label: string,
  fn: spinnerAction,
  options?: { startSpinner?: boolean }
): withSpinnerWrapper

/** sacaffold/actions */

export function createHooks(params: { gasket: GasketEngine; context: CreateContext }): Promise<void>;

export function chooseAppDescription(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function choosePackageManager(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function chooseTestPlugins(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function promptForTestPlugin(
  prompt: CreatePrompt, 
  message: string, 
  choices: { name: string; value: string; }[]
): Promise<string | null>;
export function allowExtantOverwriting(context: CreateContext, prompt: CreatePrompt): Promise<void>;
export function globalPrompts(params: { context: CreateContext }): Promise<void>;

export function loadPresets(params: { context: CreateContext }): Promise<void>;
