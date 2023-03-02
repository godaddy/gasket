import type { Gasket, GasketConfig, MaybeAsync, MaybeMultiple } from '@gasket/engine';
import type { Command, Definition, flags } from '@oclif/command';

declare module '@gasket/engine' {
  class GasketCommand<Flags = {}> extends Command {
    gasket: Gasket;
    parsed: {
      flags: Flags
    };

    gasketConfigure(gasketConfig: GasketConfig): Promise<GasketConfig>;

    gasketRun(): Promise<void>;

    run(): Promise<void>;
  }

  type GasketCommandClass<Flags = {}> = {
    new(): GasketCommand<Flags>,
    id: string;
    description: string;
    flags: {
      [K in keyof Flags]: Definition<Flags[K]>
    }
  }

  export interface HookExecTypes {
    init(): MaybeAsync<void>,

    getCommands(args: {
      GasketCommand: GasketCommandClass,
      flags: typeof flags
    }): MaybeAsync<MaybeMultiple<GasketCommandClass>>,

    configure(config: GasketConfig): MaybeAsync<GasketConfig>
  }
}
