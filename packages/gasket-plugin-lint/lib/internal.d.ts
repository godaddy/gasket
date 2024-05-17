import type { CreateContext } from 'create-gasket-app';

export interface Utils {
  gatherDevDeps(pkgName: string): Promise<Record<string, string>>;
  runScriptStr(script: string): string;
}

export interface CodeStyle {
  name?: string;
  allowStylelint?: boolean;
  create?: (context: CreateContext, utils: Utils) => Promise<void>;
}

export interface LintUtils {
  makeGatherDevDeps(context: CreateContext): Promise<string[]>;
}
