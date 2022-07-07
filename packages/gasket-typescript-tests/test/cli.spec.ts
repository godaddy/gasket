import type { Gasket, GasketConfig, Hook, Plugin } from '@gasket/engine';
import type { CreateContext } from '@gasket/cli';

describe('@gasket/cli', () => {
  it('defines the create lifecycle', () => {
    const hook: Hook<'create'> = (gasket: Gasket, context: CreateContext): void => {};
    const asyncHook: Hook<'create'> = async (gasket: Gasket, context: CreateContext): Promise<void> => {};
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

  it('validates the return from configure hooks', () => {
    // @ts-expect-error
    const hook: Hook<'create'> = async (gasket, config) => 'huh?';
  });
});
