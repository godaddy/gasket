import Gasket, { MaybeAsync, Plugin } from '@gasket/engine';

declare module '@gasket/engine' {
  interface HookExecTypes {
    example(str: string, num: number, bool: boolean): MaybeAsync<boolean>
  }
}

describe('@gasket/engine', () => {
  it('exposes the constructor interface', () => {
    // eslint-disable-next-line no-new
    new Gasket(
      { root: __dirname, env: 'test' },
      { resolveFrom: __dirname }
    );
  });

  it('should infer the types of lifecycle parameters', async function () {
    const gasket = new Gasket(
      { root: __dirname, env: 'test' },
      { resolveFrom: __dirname }
    );

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
    const engine = new Gasket(
      { root: __dirname, env: 'test' },
      { resolveFrom: __dirname }
    );

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
    const engine = new Gasket(
      { root: __dirname, env: 'test' },
      { resolveFrom: __dirname }
    );

    // Valid
    engine.hook({
      event: 'example',
      handler(gasket) {
        return gasket.command.id === 'start';
      }
    });
  });
});
