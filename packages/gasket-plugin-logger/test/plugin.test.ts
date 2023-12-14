import GasketEngine, { Gasket, Plugin } from '@gasket/engine';
import loggerPlugin, { LogLevel, Logger } from '../src';

describe('@gasket/plugin-logger', () => {
  it('creates a logger in the init lifecycle', async () => {
    const gasket = await initGasket();

    expect(gasket).toHaveProperty('logger');
  });

  it('throws an error if multiple loggers are created', async () => {
    await expect(
      initGasket({
        plugins: [
          {
            name: 'logger1',
            hooks: {
              createLogger: () => ({}) as Logger
            }
          },
          {
            name: 'logger2',
            hooks: {
              createLogger: () => ({}) as Logger
            }
          }
        ]
      })
    ).rejects.toThrow(Error);
  });

  describe('default logger', () => {
    it('has all of the log level functions', async () => {
      const gasket = await initGasket();

      ['error', 'warn', 'info', 'verbose', 'debug'].forEach(level => {
        expect(gasket.logger).toHaveProperty(level);
      });
    });

    it('can create a child logger', async () => {
      const gasket = await initGasket();

      let childLogger = gasket.logger.child({ foo: 'bar' });

      expectConsoleMethodCalledFor('error', 'error', { foo: 'bar' });
      expectConsoleMethodCalledFor('warn', 'warn', { foo: 'bar' });
      expectConsoleMethodCalledFor('info', 'info', { foo: 'bar' });
      expectConsoleMethodCalledFor('verbose', 'info', { foo: 'bar' });
      expectConsoleMethodCalledFor('debug', 'debug', { foo: 'bar' });

      childLogger = childLogger.child({ baz: 'qux' });

      expectConsoleMethodCalledFor('error', 'error', { foo: 'bar', baz: 'qux' });
      expectConsoleMethodCalledFor('warn', 'warn', { foo: 'bar', baz: 'qux' });
      expectConsoleMethodCalledFor('info', 'info', { foo: 'bar', baz: 'qux' });
      expectConsoleMethodCalledFor('verbose', 'info', { foo: 'bar', baz: 'qux' });
      expectConsoleMethodCalledFor('debug', 'debug', { foo: 'bar', baz: 'qux' });

      function expectConsoleMethodCalledFor(
        logMethod: LogLevel,
        consoleMethod: 'error' | 'warn' | 'info' | 'debug',
        metadata: Record<string, any>
      ) {
        let consoleSpy;
        try {
          consoleSpy = jest
            .spyOn(console, consoleMethod)
            .mockImplementation(() => {});
          childLogger[logMethod]('test');
          expect(consoleSpy).toHaveBeenCalledWith('test', metadata);
        } finally {
          consoleSpy?.mockRestore();
        }
      }
    });
  });

  describe('with a customLogger hook', () => {
    let gasket: Gasket;
    let customLogger: Logger;

    beforeEach(async () => {
      customLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        verbose: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
        close: jest.fn()
      };

      gasket = await initGasket({
        plugins: [{
          name: 'custom-logger',
          hooks: {
            createLogger: () => customLogger
          }
        }]
      });
    });

    it('assigns the custom logger', () => {
      expect(gasket.logger).toBe(customLogger);
    });

    it('closes the logger on exit', async () => {
      await gasket.exec('onSignal');
      expect(customLogger.close).toHaveBeenCalled();
    });
  });

  it('reports metadata', async () => {
    const gasket = new GasketEngine({
      plugins: {
        add: [loggerPlugin]
      }
    });

    const [metadata] = await gasket.exec('metadata', {
      name: '@gasket/plugin-logger',
      module: {}
    });

    expect(metadata.lifecycles?.filter(lc => lc.name === 'createLogger'))
      .toHaveLength(1);
  });

  async function initGasket(config?: { plugins?: Array<Plugin>}) {
    const gasket = new GasketEngine({
      plugins: {
        add: [loggerPlugin, ...config?.plugins ?? []]
      }
    }) as Gasket;

    await gasket.exec('init');

    return gasket;
  }
});
