import type { Gasket, GasketConfig, Hook, Plugin } from '@gasket/engine'
import '@gasket/plugin-command';

describe('@gasket/plugin-command', () => {
  it('defines the getCommands lifecycle', () => {
    const hook: Hook<'getCommands'> = (gasket: Gasket, { GasketCommand, flags }) => {
      class NewCommand extends GasketCommand {
        static id = 'do';
        static flags = {
          foo: flags.string()
        }
        
        async gasketRun() {
          this.parsed
        }
      }
      

      return NewCommand;      
    }
  });

  it('validates getCommands return values', () => {
    // @ts-expect-error
    const hook: Hook<'getCommands'> = (gasket, { GasketCommand, flags }) => {
      return 4;
    }
  });

  it('defines the init lifecycle', () => {
    const plugin: Plugin = {
      name: 'my-plugin',
      hooks: {
        init: {
          timing: {
            before: ['foo'],
          },
          handler() {}
        }
      }
    }
  });

  it('defines the configure lifecycle', () => {
    const hook: Hook<'configure'> = (gasket: Gasket, config: GasketConfig) => {
      return config;
    }
  });

  it('validates the return from configure hooks', () => {
    // @ts-expect-error
    const hook: Hook<'configure'> = async (gasket, config) => 'huh?';
  });
});
