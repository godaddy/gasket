import { Gasket, makeGasket } from '@gasket/core';
import type { GasketConfigDefinition, MaybeAsync, Plugin  } from '@gasket/core';

declare module '@gasket/core' {
  interface HookExecTypes {
    example(str: string, num: number, bool: boolean): MaybeAsync<boolean>
  }

  interface GasketConfig {
    someConfigSection?: {
      foo: string;
      bar: number;
    }
  }
}

const PluginExample = {
  name: 'example-plugin',
  version: '',
  description: '',
  hooks: {
    example(gasket: Gasket, str: string, num: number, bool: boolean) {
      return true;
    }
  }
};

describe('@gasket/core', () => {
  it('exposes the constructor interface', () => {
    // eslint-disable-next-line no-new
    makeGasket({
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      }
    });
  });

  it('checks constructor arguments', () => {
    // eslint-disable-next-line no-new
    makeGasket({
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      }
    // @ts-expect-error
    }, 'extra');
  });

  it('should infer the types of lifecycle parameters', async function () {
    const gasket = makeGasket({
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      }
    });

    await gasket.execApply('example', async function (plugin, handler) {
      handler('a string', 123, true);
    });

    // eslint-disable-next-line no-sync
    gasket.execApplySync('example', async function (plugin, handler) {
      handler('a string', 123, true);
    });
  });

  it('defines the structure of a Gasket plugin', () => {
    const myPlugin: Plugin = {
      name: 'my-plugin',
      version: '',
      description: '',
      dependencies: ['foo', 'bar'],
      hooks: {
        example(gasket, a, b, c) {
          return true;
        }
      }
    };
  });

  it('type checks the hook method', () => {
    const gasket = makeGasket({
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      }
    });

    // Valid
    gasket.hook({
      event: 'example',
      handler(_gasket, str, num, bool) {
        return true;
      }
    });

    // Unknown event type
    gasket.hook({
      // @ts-expect-error
      event: 'unknown',
      // @ts-expect-error
      handler: (_gasket) => {}
    });

    // Invalid return type
    gasket.hook({
      event: 'example',
      // @ts-expect-error
      handler(_gasket, str, num, bool) {
        return 'invalid';
      }
    });
  });

  it('exposes the running command on the Gasket interface', () => {
    const gasket = makeGasket({
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      }
    });

    // Valid
    gasket.hook({
      event: 'example',
      handler(_gasket) {
        return _gasket.config.command === 'start';
      }
    });
  });

  it('allows environments to contain plugins', () => {
    const config: GasketConfigDefinition = {
      plugins: [PluginExample],
      environments: {
        dev: {
          plugins: [
            { name: 'dev-plugin', version: '', description: '', hooks: {} },
            // @ts-expect-error
            { /* missing name */ hooks: {} },
            // @ts-expect-error
            { name: 'missing-hooks' }
          ]
        }
      }
    };
  });

  it('allows partial environment config overrides', () => {
    const config: GasketConfigDefinition = {
      plugins: [PluginExample],
      someConfigSection: {
        foo: 'foo',
        bar: 123
      },
      environments: {
        dev: {
          someConfigSection: {
            foo: 'dev-foo'
          }
        }
      }
    };
  });
});
