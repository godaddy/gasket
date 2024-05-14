import type { Gasket, Hook } from '@gasket/core';
import { CreateContext } from 'create-gasket-app';

describe('create-gasket-app', () => {
  it('defines the create lifecycle', () => {
    // @ts-ignore
    const hook: Hook<'create'> = (gasket: Gasket, context: CreateContext): void => { };
    // @ts-ignore
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

      // TODO: need to support statements with generating gasket config
      // gasketConfig.add('plugins', { add: ['@my/gasket-plugin'] });

      await pkgManager.exec('echo', ['hello', 'world']);
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
