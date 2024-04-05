import Gasket from '@gasket/engine';
import type { GasketConfigDefinition, MaybeAsync, Plugin  } from '@gasket/engine';

declare module '@gasket/engine' {
  interface HookExecTypes {
    example(str: string, num: number, bool: boolean): MaybeAsync<boolean>
  }
}

const PluginExample = {
  name: 'example-plugin',
  hooks: {
    example(gasket: Gasket, str: string, num: number, bool: boolean) {
      return true;
    }
  }
};

describe('@gasket/engine', () => {
  it('exposes the constructor interface', () => {
    // eslint-disable-next-line no-new
    new Gasket({ plugins: [PluginExample] });
  });

  it('checks constructor arguments', () => {
    // eslint-disable-next-line no-new
    new Gasket({
      plugins: [PluginExample],
      // @ts-expect-error
      extra: true
    });
  });

  it('should infer the types of lifecycle parameters', async function () {
    const gasket = new Gasket({ plugins: [PluginExample] });

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
      dependencies: ['foo', 'bar'],
      hooks: {
        example(gasket, a, b, c) {
          return true;
        }
      }
    };
  });

  it('type checks the hook method', () => {
    const engine = new Gasket({ plugins: [PluginExample] });

    // Valid
    engine.hook({
      event: 'example',
      handler(gasket, str, num, bool) {
        return true;
      }
    });

    // Unknown event type
    engine.hook({
      // @ts-expect-error
      event: 'unknown',
      // @ts-expect-error
      handler: (gasket) => {}
    });

    // Invalid return type
    engine.hook({
      event: 'example',
      // @ts-expect-error
      handler(gasket, str, num, bool) {
        return 'invalid';
      }
    });
  });

  it('exposes the running command on the Gasket interface', () => {
    const engine = new Gasket({ plugins: [PluginExample] });

    // Valid
    engine.hook({
      event: 'example',
      handler(gasket) {
        return gasket.command.id === 'start';
      }
    });
  });

  it('allows environments to contain plugins', () => {
    const config: GasketConfigDefinition = { environments: { dev: { plugins: { add: ['plugin-name'] } } } };
  });
});
