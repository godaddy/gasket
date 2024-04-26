import type { CreateContext } from '@gasket/cli';

export interface EslintConfig {
  extends?: string[];
  settings?: {
    localeFiles: string[];
  };
  env?: Record<string, boolean>;
  rules?: Record<string, any>;
}

export interface StylelintConfig {
  extends?: string[];
}

export interface StandardConfig {
  env?: string[];
  ignore?: string[];
}

declare module '@gasket/cli' {
  export interface CreateContext {
    codeStyle?: string;
    eslintConfig?: string;
    stylelintConfig?: string;
    addStylelint?: boolean;
  }

  export interface PackageJson {
    eslintConfig?: EslintConfig;
    stylelint?: StylelintConfig;
    eslintIgnore?: string[];
    standard?: StandardConfig;
  }
}

export interface CodeStyle {
  name?: string;
  allowStylelint?: boolean;
  create?: (context: CreateContext, utils: Utils) => Promise<void>;
}

export interface Utils {
  gatherDevDeps(pkgName: string): Promise<Record<string, string>>;
  runScriptStr(script: string): string;
}

export interface LintUtils {
  makeGatherDevDeps(context: CreateContext): Promise<string[]>;
}