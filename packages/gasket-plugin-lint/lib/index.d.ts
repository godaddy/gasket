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

declare module 'create-gasket-app' {
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
