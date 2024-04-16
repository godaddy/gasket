import type { Gasket, Hook } from '@gasket/engine';
import type { Config } from '@gasket/cli';

describe('@gasket/cli', () => {

  it('defines the commands hook', () => {
    const hook: Hook<'commands'> = async (gasket: Gasket, config: Config) => {
      return [
        {
          id: 'my-command',
          description: 'My command description',
          action: async (...args: any[]) => { }
        }
      ];
    };

  });

  it('defines the commandOptions hook', () => {
    const hook: Hook<'commandOptions'> = async (gasket: Gasket, config: Config) => {
      return [
        {
          name: 'my-option',
          description: 'My option description',
          type: 'string',
          default: 'default-value'
        }
      ];
    };
  });
});
