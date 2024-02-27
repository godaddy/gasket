/* eslint-disable no-console */
const { name, hooks } = require('../lib'); // Update the path accordingly

// Mock console methods
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'debug').mockImplementation(() => {});

// Mock logger object
const mockLogger = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  child: jest.fn()
};

describe('@gasket/plugin-logger', () => {
  describe('Name property', () => {
    it('should have a name property from package.json', () => {
      expect(name).toBeDefined();
      expect(name).toEqual(require('../package.json').name);
    });
  });

  describe('Hooks', () => {
    let gasket;

    beforeEach(() => {
      gasket = {
        exec: jest.fn(),
        logger: null
      };
    });

    describe('init', () => {
      it('should set logger from the first plugin if only one logger is hooked', async () => {
        const fakeLogger = { ...mockLogger };
        gasket.exec.mockResolvedValue([fakeLogger]);

        await hooks.init(gasket);

        expect(gasket.logger).toEqual(fakeLogger);
      });

      it('should set logger to default if no loggers are hooked', async () => {
        gasket.exec.mockResolvedValue([]);

        await hooks.init(gasket);

        // Check default logger behavior
        const childLogger = gasket.logger.child({ key: 'value' });
        childLogger.error('error message');
        childLogger.warn('warn message');
        childLogger.info('info message');
        childLogger.debug('debug message');

        // Ensure console methods were called
        expect(console.error).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalled();
        expect(console.info).toHaveBeenCalled();
        expect(console.debug).toHaveBeenCalled();

        // Ensure logger is set to default
        expect(gasket.logger).toEqual({
          error: console.error,
          warn: console.warn,
          info: console.info,
          debug: console.debug,
          child: expect.any(Function)
        });
      });

      it('should throw an error if multiple loggers are hooked', async () => {
        const fakeLogger1 = { error: jest.fn() };
        const fakeLogger2 = { error: jest.fn() };
        gasket.exec.mockResolvedValue([fakeLogger1, fakeLogger2]);

        await expect(hooks.init(gasket)).rejects.toThrow(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      });
    });

    describe('onSignal', () => {
      it('should close logger if available', async () => {
        const fakeLogger = { close: jest.fn() };
        gasket.logger = fakeLogger;

        await hooks.onSignal(gasket);

        expect(fakeLogger.close).toHaveBeenCalled();
      });

      it('should not throw error if logger is not available', async () => {
        await expect(hooks.onSignal(gasket)).resolves.not.toThrow();
      });
    });

    describe('metadata', () => {
      it('should return metadata with lifecycle information', () => {
        const meta = hooks.metadata(gasket, { otherData: 'example' });

        expect(meta).toEqual(
          expect.objectContaining({
            lifecycles: expect.arrayContaining([
              expect.objectContaining({
                name: 'createLogger',
                method: 'exec',
                description: 'Custom logger creation',
                link: 'README.md#createLogger',
                parent: 'init'
              })
            ])
          })
        );
      });
    });
  });
});
