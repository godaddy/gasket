import type { Gasket } from '@gasket/engine';
import type { Command, flags } from '@oclif/command';
import type { IFlag } from '@oclif/command/lib/flags';

declare module '@gasket/engine' {
  class GasketCommand<Flags = {}> extends Command {
    gasket: Gasket;
    parsed: Flags;

    gasketConfigure(gasketConfig: GasketConfig): Promise<GasketConfig>;
    gasketRun(): Promise<void>;

    run(): Promise<void>;
  }

  type GasketCommandClass<Flags = {}> = {
    new(): GasketCommand<Flags>,
    id: string;
    description: string;
    flags: {
      [K in keyof Flags]: IFlag<Flags[K]>
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
