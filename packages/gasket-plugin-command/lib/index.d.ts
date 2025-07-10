import type { Plugin, MaybeAsync } from '@gasket/core';
import type {
  GasketArgDefinition,
  GasketOptionDefinition
} from './internal.js';

export interface GasketCommandDefinition {
  /* Command id/name */
  id: string;

  /* Command description */
  description: string;

  /* Command arguments */
  args?: Array<GasketArgDefinition>;

  /* Command options */
  options?: Array<GasketOptionDefinition>;

  /* Command action handler */
  action: (...args: any[]) => MaybeAsync<void>;

  /* Hide from help output */
  hidden?: boolean;

  /* Default command to run if no command is provided */
  default?: boolean;
}

declare module '@gasket/core' {
  /* Custom command name/id */
  export interface GasketConfig {
    command?: string;
  }

  interface HookExecTypes {
    commands(): GasketCommandDefinition | Array<GasketCommandDefinition>;
    build(): void;
  }
}

declare const plugin: Plugin;
export default plugin;
