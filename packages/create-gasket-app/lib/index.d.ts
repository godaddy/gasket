import type { GasketConfigDefinition, MaybeAsync, Plugin, GasketEngine } from '@gasket/core';
import type { PackageManager } from '@gasket/utils';
import type { PromptModule } from 'inquirer';

export interface Dependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface PackageJson extends Dependencies {
  name: string;
  version?: string;
  description?: string;
  license?: string;
  type?: 'commonjs' | 'module';
  repository?:
  | string
  | {
    type: 'git';
    url: string;
  };
  scripts?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  homepage?: string;
}

export interface ModuleInfo {
  name: string;
  module: any;
  path?: string;
  package?: PackageJson;
  version?: string;
}

export interface PresetInfo extends ModuleInfo { }

export interface PluginInfo extends ModuleInfo { }

export interface ConfigBuilder<Config> {
  /**
   * fields object
   */
  fields: { [key: string]: any };

  /**
   * Adds all `[key, value]` pairs in the `fields` provided.
   * @param fields - Object to merge. Can be a function that accepts the current fields and object to merge.
   */
  extend(
    fields: Partial<Config> | ((current: Config) => Partial<Config>)
  ): void;

  /**
   * Performs an intelligent, domain-aware merge of the `value` for
   * the given `key` into the package.json fields associated with this instance.
   *
   * @param key - Field in package.json to add or extend.
   * @param value - Target value to set for key provided.
   * @param [options] - Optional arguments for add behavior
   * @param [options.force] - Should the semver version override other attempts
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L117-L150
   */
  add<Key extends keyof Config>(
    key: Key,
    value: Config[Key],
    options?: { force?: boolean }
  ): void;

  /**
   * addPlugin - Add plugin import to the gasket file and use the value in the plugins array
   * @param {string} pluginImport - name of the import used as a value - `import pluginImport...`
   * @param {string} pluginName - name of the plugin import/package - `from 'pluginName'`
   * @example
   * addPlugin('pluginA', '@gasket/plugin-a')
   *
   * // gasket.js
   * import pluginA from '@gasket/plugin-a';
   *
   * export default makeGasket({
   *  plugins: [
   *    pluginA
   *  ]
   * });
   */
  addPlugin(pluginImport: string, pluginName: string): void;

  /**
   * addImport - Add a non-plugin import to the gasket file
   * @param {string} importName - name of the import used as a value - `import fs...`
   * @param {string} importPath - path of the import - `from 'fs'`
   * @returns {ConfigBuilder} - instance for chaining
   * @example
   * Can be default or named import
   * addImport('{ readFileSync }', 'fs')
   * addImport('fs', 'fs')
   *
   * // gasket.js
   * import { readFileSync } from 'fs';
   * import fs from 'fs';
   */
  addImport(importName: string, importPath: string): ConfigBuilder<Config>;

  /**
   * addExpression - add programmatic expression to the gasket file
   * @param {string} expression - expression to add after imports
   * @returns {ConfigBuilder} - instance for chaining
   * @example
   *
   * .addImport('fs', 'fs')
   * .addExpression('const file = fs.readFileSync(\'./file.txt\')')
   *
   * // gasket.js
   * import fs from 'fs';
   * const file = fs.readFileSync('./file.txt');
   */
  addExpression(expression: string): ConfigBuilder<Config>;

  /**
   * injectValue - Inject a value into the gasket config object
   * @param {string} configKey - collapsed object path to inject value into - `express.config.routes`
   * @param {string} injectedValue - string used as a value
   * @example
   * .addImport('{ routes }', './routes')
   * .injectValue('express.routes', 'routes');
   *
   * // gasket.js
   * export default makeGasket({
   *  express: {
   *    routes: routes
   *  }
   * });
   */
  injectValue(configKey: string, injectedValue: string): void;
}

export interface PackageJsonBuilder extends ConfigBuilder<PackageJson> {
  /**
   * Checks if a property exists on the package.json fields.
   * @param  key - Field to search
   * @param  value - Value to search for
   * @returns True if the property exists and matches the value
   */
  has(key: keyof PackageJson, value: string): boolean;
}

export interface Files {
  add(...args: string[]): void;
}

export interface Readme {
  /** Markdown content to be injected into the app readme */
  markdown: string[];

  /** Links to be added to the footer */
  links: string[];

  /** Add a markdown heading */
  heading(content: string, level?: number): Readme;

  /** Add a markdown sub-heading */
  subHeading(content: string): Readme;

  /** Add markdown content */
  content(markdown: string);

  /** Add a markdown list */
  list(items: string[]): Readme;

  /** Add a markdown link - printed in footer */
  link(content: string, href: string): Readme;

  /** Add a markdown code block */
  codeBlock(content: string, syntax?: string): Readme;

  /** Add markdown file */
  markdownFile(path: string): Promise<Readme>;
}

export type CreatePrompt = PromptModule;

declare module 'create-gasket-app' {
  export interface CreateContext {
    /** Short name of the app */
    appName: string;

    /** Current work directory */
    cwd: string;

    /** Path to the target app (Default: cwd/appName) */
    dest: string;

    /** Relative path to the target app */
    relDest: string;

    /** Whether or not target directory already exists */
    extant: boolean;

    /** paths to the local presets packages */
    localPresets: Array<string>;

    /** Raw preset desc from args. Can include version constraint. Added by
     * load-preset if using localPresets. */
    rawPresets: Array<string>;

    /** Local packages that should be linked */
    pkgLinks: Array<string>;

    /** non-error/warning messages to report */
    messages: Array<string>;

    /** warnings messages to report */
    warnings: Array<string>;

    /** error messages to report but do not exit process */
    errors: Array<string>;

    /** any next steps to report for user */
    nextSteps: Array<string>;

    /** any generated files to show in report */
    generatedFiles: Set<string>;

    /** Default empty array, populated by load-preset with actual imports */
    presets: Array<Plugin>;

    /** Default to object w/empty plugins array to be populated by `presetConfig` hook */
    presetConfig: GasketConfigDefinition;

    // Added by `global-prompts`

    /** Description of app */
    appDescription: string;

    /** Should a git repo be initialized and first commit */
    gitInit: boolean;

    /** Names of the plugins that add unit and integration tests */
    testPlugins: Array<string>;

    /** Which package manager to use (Default: 'npm') */
    packageManager: string;

    /** Derived install command (Default: 'npm install') */
    installCmd: string;

    /** Derived local run command (Default: 'npx gasket local') */
    localCmd: string;

    /** Whether or not the user wants to override an extant directory */
    destOverride: boolean;

    // Added by `setup-pkg`

    /** package.json builder */
    pkg: PackageJsonBuilder;

    /** manager to execute npm or yarn commands */
    pkgManager: PackageManager;

    // Added by `setup-gasket-config`

    /** gasket.config builder */
    gasketConfig: ConfigBuilder<GasketConfigDefinition>;

    // Added by `create-hooks`

    /** Use to add files and templates to generate */
    files: Files;

    /** Use to add content to the README.md */
    readme: Readme;
  }
}

export interface ActionWrapperParams {
  gasket: GasketEngine;
  context: CreateContext;
  spinner?: any;
}

declare module '@gasket/core' {

  export interface HookExecTypes {
    presetPrompt(
      context: CreateContext,
      utils: {
        prompt: CreatePrompt;
      }
    ): Promise<void>;
    presetConfig(context: CreateContext): Promise<CreateContext['presetConfig']>;
    prompt(
      context: CreateContext,
      utils: {
        prompt: CreatePrompt;
      }
    ): MaybeAsync<CreateContext>;

    create(context: CreateContext): MaybeAsync<void>;

    postCreate(
      context: CreateContext,
      utils: {
        runScript: (script: string) => Promise<void>;
      }
    ): MaybeAsync<void>;
  }
}
