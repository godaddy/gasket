import type { GasketConfigFile, MaybeAsync } from '@gasket/engine';
import type { PackageManager } from '@gasket/utils';
import type { Command } from 'commander';

export interface Config {
  bin: Command;
  root: string;
  options: Record<string, any>;
  [key: string]: any;
}

export interface CLICommand {
  id: string;
  description: string;
  args?: Array<CLICommandArg>;
  options?: Array<CLICommandOption>;
  action: (...args: any[]) => MaybeAsync<void>;
  hidden?: boolean; // Hide from help output
  default?: boolean; // Default command to run if no command is provided
}

export interface ProccesedCLICommand {
  command: Command;
  hidden: boolean;
  isDefault: boolean;
}

// Default cannot be used when required is true
export type CLICommandArg = {
  name: string;
  description: string;
  required?: true;
  default?: never;
} | {
  name: string;
  description: string;
  required?: false;
  default?: any;
};

export type ProccesedCLICommandArg = Array<string | boolean>;

export interface CLICommandOption {
  name: string;
  description: string;
  required?: boolean;
  short?: string;
  parse?: (value: string) => any;
  type?: 'string' | 'boolean';
  conflicts?: Array<string>; // list of option names that cannot be used together
  hidden?: boolean; // Hide from command help output
  default?: any; // default value
}

export interface ProccesedCLICommandOption {
  options: Array<string>;
  conflicts: Array<string>;
  hidden: boolean;
  defaultValue: any | undefined;
  parse: (value: string) => any | undefined;
  required: boolean;
}

export interface Dependencies {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface PackageJson extends Dependencies {
  name: string;
  version: string;
  description?: string;
  license?: string;
  repository?:
  | string
  | {
    type: 'git';
    url: string;
  };
  scripts?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export interface ModuleInfo {
  name: string;
  module: any;
  path?: string;
  package?: PackageJson;
  version?: string;
}

export interface PresetInfo extends ModuleInfo {
}

export interface PluginInfo extends ModuleInfo {
}

export interface ConfigBuilder<Config> {
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
}

export interface PackageJsonBuilder extends ConfigBuilder<PackageJson> {
  /**
   * Checks if a dependency has been already added
   * @param  key - Dependency bucket
   * @param  value - Dependency to search
   * @returns True if the dependency exists on the bucket
   */
  has(key: keyof Dependencies, value: string): boolean;
}

export interface Files {
  add(...args: string[]): void
}

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

  /** Raw plugin desc from flags, prompts, etc. Can include constraints. */
  rawPlugins: Array<string>;

  /** Short names of plugins */
  plugins: Array<string>;

  /** Local packages that should be linked */
  pkgLinks: Array<string>;

  /** Path to npmconfig file */
  npmconfig: string;

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

  // Added by `global-prompts`

  /** Description of app */
  appDescription: string;

  /** Should a git repo be initialized and first commit */
  gitInit: boolean;

  /** Name of the plugin for unit tests */
  testPlugin: string;

  /** Which package manager to use (Default: 'npm') */
  packageManager: string;

  /** Derived install command (Default: 'npm install') */
  installCmd: string;

  /** Derived local run command (Default: 'npx gasket local') */
  localCmd: string;

  /** Whether or not the user wants to override an extant directory */
  destOverride: boolean;

  // Added by `load-preset`

  /** Short name of presets */
  presets: Array<string>;

  /** Shallow load of presets with meta data */
  presetInfos: Array<PresetInfo>;

  // Added by `cli-version`

  /** Version of current CLI used to issue `create` command */
  cliVersion: string;

  /** Version of CLI to install, either current or min compatible version
   * required by preset(s) */
  cliVersionRequired: string;

  // Added by `setup-pkg`

  /** package.json builder */
  pkg: PackageJsonBuilder;

  /** manager to execute npm or yarn commands */
  pkgManager: PackageManager;

  // Added by `setup-gasket-config`

  /** gasket.config builder */
  gasketConfig: ConfigBuilder<GasketConfigFile>;

  // Added by `create-hooks`

  /** Use to add files and templates to generate */
  files: Files;
}

declare module '@gasket/engine' {
  export interface HookExecTypes {
    getCommandOptions(config: Config): MaybeAsync<Array<CLICommandOption>>;

    getCommands(config: Config): MaybeAsync<Array<CLICommand> | CLICommand>;

    prompt(
      context: CreateContext,
      utils: {
        prompt: (prompts: Array<Record<string, any>>) => Promise<Record<string, any>>,
        addPlugins: (plugins: Array<string>) => Promise<void>
      }
    ): MaybeAsync<CreateContext>;

    create(context: CreateContext): MaybeAsync<void>;

    postCreate(
      context: CreateContext,
      utils: {
        runScript: (script: string) => Promise<void>
      }): MaybeAsync<void>;
  }
}
