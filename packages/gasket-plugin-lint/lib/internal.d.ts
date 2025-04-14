import type { CreateContext } from 'create-gasket-app';

export function gatherDevDeps(pkgName: string): Record<string, string>;
export function runScriptStr(script: string): string;
export function safeRunScript(name: string): Promise<void>;
export function makeGatherDevDeps(): typeof gatherDevDeps;
export function makeRunScriptStr(context: CreateContext): typeof runScriptStr;
export function makeSafeRunScript(context: CreateContext, runScript): typeof safeRunScript;

type Utils = {
  gatherDevDeps: typeof gatherDevDeps, runScriptStr?: typeof runScriptStr
}

export interface CodeStyle {
  name?: string;
  allowStylelint?: boolean;
  create?: (context: CreateContext, utils: Utils) => void;
}
