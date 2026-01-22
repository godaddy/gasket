import type { GasketConfigDefinition, MaybeAsync, Plugin, GasketEngine } from '@gasket/core';
import type { PromptModule } from 'inquirer';
import type ora from 'ora';
import type { Command } from 'commander';

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

interface CommandArgument {
  name: string;
  description?: string;
  required?: boolean;
  default?: any;
}

interface CommandOption {
  name: string;
  description: string;
  required?: boolean;
  short?: string;
  parse?: (value: string) => any;
  type?: string;
  conflicts?: string | string[];
  hidden?: boolean;
  default?: any;
}

export interface CreateCommandOptions {
  template?: string;
  templatePath?: string;
  npmLink?: string[];
  packageManager?: string;
  prompts?: boolean;
  config?: string;
  configFile?: string;
}

export function createCommandAction(
  appname: string,
  options: CreateCommandOptions,
  command: Command
): Promise<void>;

export interface CreateCommand {
  id: string;
  description: string;
  args: CommandArgument[];
  action?: typeof createCommandAction;
  options: CommandOption[];
  hidden?: boolean;
  default?: boolean;
}

export interface ModuleInfo {
  name: string;
  module: any;
  path?: string;
  package?: PackageJson;
  version?: string;
}

export interface PluginInfo extends ModuleInfo { }

export interface ConfigBuilder<Config> {
  /** fields object */
  fields: { [key: string]: any };
  original?: { [key: string]: any };
  source?: Plugin;
  orderBy?: string[];
  orderedFields?: string[];
  objectFields?: string[];
  semverFields?: string[];
  blame?: Map<string, string[]>;
  force?: Set<any>;
  warnings?: string[];

  /**
   * Adds all `[key, value]` pairs in the `fields` provided.
   * @param fields - Object to merge. Can be a function that accepts the current fields and object to merge.
   * @param source - Plugin to blame if conflicts arise from this operation.
   */
  extend(
    fields: Partial<Config> | ((current: Config) => Partial<Config>),
    source: Plugin
  ): void;
  extend(fields: Partial<Config> | ((current: Config) => Partial<Config>)): void;

  /**
   * Performs an intelligent, domain-aware merge of the `value` for
   * the given `key` into the package.json fields associated with this instance.
   * @param key - Field in package.json to add or extend.
   * @param value - Target value to set for key provided.
   * @param source - Plugin to blame if conflicts arise from this operation.
   * @param [options] - Optional arguments for add behavior
   * @param [options.force] - Should the semver version override other attempts
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L117-L150
   */
  add<Key extends keyof Config & string>(
    key: Key,
    value: Config[Key],
    source: Plugin,
    options?: { force?: boolean }
  ): void;
  add(key: string, value: object, options?: object): void;

  /**
   * Remove a key from fields
   * @param {string[]} path - Array of strings representing the path to the field to remove
   */
  remove(path: string[]): void;

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
   * addEnvironment - Add environments to the gasket file
   * @param {string} key - name of the environment - `local.analyze`
   * @param {object} value - configuration for the environment - `{
   *   dynamicPlugins: [
   *     '@gasket/plugin-analyze',
   *   ]
   * }`
   * @example
   *   environments: {
   *    'local.analyze': {
   *      dynamicPlugins: [
   *        '@gasket/plugin-analyze',
   *      ]
   *     }
   *   },
   */
  addEnvironment(key: string, value: object): void;

  /**
   * addCommand - Add commands to the gasket file
   * @param {string} key - name of the command - `docs`
   * @param {object} value - configuration for the command - `{
   *   dynamicPlugins: [
   *     '@gasket/plugin-docs',
   *   ]
   * }`
   * @example
   *   commands: {
   *    'docs': {
   *      dynamicPlugins: [
   *        '@gasket/plugin-docs',
   *      ]
   *     }
   *   },
   */
  addCommand(key: string, value: object): void;

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

/**
 * Interface for the Files class.
 */
interface Files {
  /**
   * Array of glob sets, each containing an array of globs and a source object.
   */
  globSets: Array<{ globs: string[], source: Plugin }>;

  /**
   * Return array of globs.
   * @deprecated
   * @returns {string[]} `globby` compatible patterns.
   */
  readonly globs: string[];

  /**
   * Adds the specified `globby` compatible patterns, `globs`,
   * into the set of all sources for this set of files.
   * @param {object} params - Object containing `globs` and `source`.
   * @param {string[]} params.globs - `globby` compatible patterns.
   * @param {object} params.source - Plugin to blame if conflicts arise from this operation.
   */
  add(params: { globs: string[], source: object }): void;
  add(...globs: string[]): void;

  /** Add a warning message if this.warnings exists else log it as a warming */
  warn(message: string): void;

  /**
   * Checks if a dependency has been already added
   * @param  {string} key Dependency bucket
   * @param  {string} value Dependency to search
   * @returns {boolean} True if the dependency exists on the bucket
   */
  has(key: string, value: string): boolean;

  /**
   * Returns the existing and target array merged without duplicates
   * @param  {Array} existing Partial lattice to merge.
   * @param  {Array} target   Partial lattice to merge.
   * @returns {Array} existing ∪ (i.e. union) target
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/GeneratorAPI.js#L15
   */
  mergeArrayDeduped(existing: any[], target: any[]): any[];

  /**
   * Attempts to merge all entries within the `value` provided by
   * the plugin specified by `name` into the `existing` semver-aware
   * Object `key` (e.g. dependencies, etc.) for this instance.
   *
   * Merge algorithm:
   *
   * - ∀   [dep, ver] := Object.entries(value)
   *   and [prev]     := any existing version for dep
   *
   *   - If ver is not valid semver ––> ■
   *   - If ¬∃ prev                 ––> set and blame [dep, ver]
   *   - If ver > prev              ––> set and blame [dep, ver]
   *   - If ¬(ver ∩ prev)           ––> Conflict. Print.
   * @param {object} options
   * @param  {string} options.key      {devD,peerD,optionalD,d}ependencies
   * @param  {object} options.value    Updates for { name: version } pairs
   * @param  {object} options.existing Existing { name: version } pairs
   * @param  {string} options.name     Plugin name providing merge `value``
   * @param {boolean} [options.force]  Should the semver version override other attempts
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js
   */
  semanticMerge({ key, value, existing, name, force }: {
    key: string;
    value: any;
    existing: any;
    name: string;
    force?: boolean;
  }): void;

  /**
   * Normalizes a potential semver range into a semver string
   * and returns the newest version
   * @param  {string} r1 Semver string (potentially invalid).
   * @param  {string} r2 Semver string (potentially invalid).
   * @returns {string | undefined} Newest semver version.
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/mergeDeps.js#L58-L64
   */
  tryGetNewerRange(r1: string, r2: string): string | undefined;

  /**
   * Performs a naive attempt to take a transform a semver range
   * into a concrete version that may be used for "newness"
   * comparison.
   * @param  {string} range Valid "basic" semver:   ^X.Y.Z, ~A.B.C, >=2.3.x, 1.x.x
   * @returns {string} Concrete as possible version: X.Y.Z,  A.B.C,   2.3.0, 1.0.0
   */
  rangeToVersion(range: string): string;

  /**
   * Orders top-level keys by `orderBy` options with any fields specified in
   * the `orderFields` options having their keys sorted.
   * @returns {object} Ready to be serialized JavaScript object.
   */
  toJSON(): object;

  /**
   * Orders the given object, `obj`, applying any (optional)
   * key order specified via `orderBy`. If no `orderBy` is provided
   * keys are ordered lexographically.
   * @param  {object}   obj       Object to transform to ordered keys
   * @param  {string[]} [orderBy] Explicit key order to use.
   * @returns {object} Shallow clone of `obj` with ordered keys
   *
   * Adapted from @vue/cli under MIT License:
   * https://github.com/vuejs/vue-cli/blob/f09722c/packages/%40vue/cli/lib/util/sortObject.js
   */
  toOrderedKeys(obj: object, orderBy?: string[]): object;
}

export interface Readme {
  /** Markdown content to be injected into the app readme */
  markdown: string[];

  /** Links to be added to the footer */
  links: string[];

  addNewLine(): this;

  /** Add a markdown heading */
  heading(content: string, level?: number): this;

  /** Add a markdown sub-heading */
  subHeading(content: string): this;

  /** Add markdown content */
  content(markdown: string);

  /** Add a markdown list */
  list(items: string[]): this;

  /** Add a markdown link - printed in footer */
  link(content: string, href: string): this;

  /** Add a markdown code block */
  codeBlock(content: string, syntax?: string): this;

  /** Add markdown file */
  markdownFile(path: string): Promise<this>;
}

type NoopPromptObject = {
  [key: string]: any;
};
type NoopPromptFunction = () => NoopPromptObject;
export type CreatePrompt = PromptModule | NoopPromptFunction;

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

  /** (INTERNAL) false to skip the prompts */
  prompts: boolean;

  /** temporary directory */
  tmpDir: string;

  /** template to use for app creation */
  template?: string;

  /** path to local template package */
  templatePath?: string;

  /** resolved template directory path */
  templateDir?: string;

  /** resolved template name for display */
  templateName?: string;

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
  pkgManager: any;

  // Added by `setup-gasket-config`

  /** gasket.config builder */
  gasketConfig: ConfigBuilder<GasketConfigDefinition>;

  // Added by `create-hooks`

  /** Use to add files and templates to generate */
  files: Files;

  /** Use to add content to the README.md */
  readme: Readme;
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  constructor(initContext?: Partial<CreateContext>);
  runWith(plugin: Plugin): CreateContext;
  /** Flag indicating if typescript is enabled */
  typescript?: boolean;
  /** Flag indicating if API app is enabled */
  apiApp?: boolean;
  addApiRoutes?: boolean;
}

export interface ActionWrapperParams {
  gasket: GasketEngine;
  context: CreateContext;
  spinner?: ora.Ora;
}

declare module '@gasket/core' {

  export interface HookExecTypes {
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

declare global {
  namespace NodeJS {
    interface Process {
      noDeprecation?: boolean;
    }
  }
}
