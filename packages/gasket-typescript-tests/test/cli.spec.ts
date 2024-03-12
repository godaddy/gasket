import type { Gasket, GasketConfig, Hook, MaybeAsync, Plugin } from '@gasket/engine';
import type { Config, CreateContext } from '@gasket/cli';

describe('@gasket/cli', () => {
  it('defines the create lifecycle', () => {
    const hook: Hook<'create'> = (gasket: Gasket, context: CreateContext): void => { };
    const asyncHook: Hook<'create'> = async (gasket: Gasket, context: CreateContext): Promise<void> => { };
  });

  it('describes the create context helpers', () => {
    const hook: Hook<'create'> = async (gasket: Gasket, context: CreateContext) => {
      const { pkg, files, gasketConfig, pkgManager } = context;

      pkg.add('devDependencies', { 'left-pad': '^1.0.0' });
      pkg.add('devDependencies', { 'left-pad': '^1.0.0' }, { force: true });

      files.add('generator/**/*');
      files.add(
        'generator/*',
        'generator/**/*'
      );

      gasketConfig.add('plugins', { add: ['@my/gasket-plugin'] });

      await pkgManager.exec('echo', ['hello', 'world']);
    };
  });

  it('defines the getCommands hook', () => {
    const hook: Hook<'getCommands'> = async (gasket: Gasket, config: Config) => {
      return [
        {
          name: 'my-command',
          description: 'My command description',
          action: async (...args: any[]) => {
            // ...
          }
        }
      ];
    };
  });

  it('defines the getCommandOptions hook', () => {
    const hook: Hook<'getCommandOptions'> = async (gasket: Gasket, config: Config) => {
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

  it('defines the prompt hook', () => {
    const hook: Hook<'prompt'> = async (gasket: Gasket, context: CreateContext, utils: any) => {
      return context;
    };
  });

  it('defines the postCreate hook', () => {
    const hook: Hook<'postCreate'> = async (gasket: Gasket, context: CreateContext, utils: any) => {
      await utils.runScript('echo "hello, world"');
    };
  });

  it('validates the return from configure hooks', () => {
    // @ts-expect-error
    const hook: Hook<'create'> = async (gasket, config) => 'huh?';
  });
});
