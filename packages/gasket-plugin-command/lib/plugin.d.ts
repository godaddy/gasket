import type {
  Gasket,
  GasketConfig,
  MaybeAsync,
  MaybeMultiple
} from '@gasket/engine';
import type { Command, flags } from '@oclif/command';

declare module '@gasket/engine' {
  class GasketCommand<Flags = {}> extends Command {
    gasket: Gasket;
    parsed: {
      flags: Flags;
    };

    /**
     * Virtual method which may be overridden by subclasses, to adjust the
     * Gasket Config.
     * @async
     */
    gasketConfigure(gasketConfig: GasketConfig): Promise<GasketConfig>;

    /**
     * Abstract method which must be implemented by subclasses, used to execute
     * Gasket lifecycles, following the `init` and `configure` Gasket lifecycles.
     * @async
     * @abstract
     */
    gasketRun(): Promise<void>;

    run(): Promise<void>;
  }

  type GasketCommandClass<Flags = {}> = {
    new (): GasketCommand<Flags>;
    id: string;
    description: string;
    flags: {
      [K in keyof Flags]: flags.IFlag<Flags[K] | undefined>;
    };
  };

  export interface HookExecTypes {
    init(): MaybeAsync<void>;

    getCommands(args: {
      GasketCommand: GasketCommandClass;
      flags: typeof flags;
    }): MaybeAsync<MaybeMultiple<GasketCommandClass>>;

    configure(config: GasketConfig): MaybeAsync<GasketConfig>;
  }
}
