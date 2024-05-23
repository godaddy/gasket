import type { CreateContext } from 'create-gasket-app';

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

export default {
  name: '@gasket/plugin-lint',
  hooks: {}
};
