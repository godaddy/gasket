/* eslint-disable no-console, no-sync */
const plugin = require('../lib'); // Update the path accordingly
const { name, version, description } = require('../package.json');

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
  describe('Plugin properties', () => {
    it('should have properties from package.json', () => {
      expect(plugin).toHaveProperty('name', name);
      expect(plugin).toHaveProperty('version', version);
      expect(plugin).toHaveProperty('description', description);
    });
  });

  describe('plugin.hooks', () => {
    let gasket;

    beforeEach(() => {
      gasket = {
        execSync: jest.fn(),
        logger: null
      };
    });

    describe('init', () => {
      it('should set logger from the first plugin if only one logger is hooked', async () => {
        const fakeLogger = { ...mockLogger };
        gasket.execSync.mockReturnValue([fakeLogger]);

        plugin.hooks.init(gasket);

        expect(gasket.logger).toEqual(fakeLogger);
      });

      it('should set logger to default if no loggers are hooked', async () => {
        gasket.execSync.mockReturnValue([]);

        plugin.hooks.init(gasket);

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

      it('should throw an error if multiple loggers are hooked', () => {
        const fakeLogger1 = { error: jest.fn() };
        const fakeLogger2 = { error: jest.fn() };
        gasket.execSync.mockReturnValue([fakeLogger1, fakeLogger2]);

        // eslint-disable-next-line max-nested-callbacks
        expect(() => plugin.hooks.init(gasket)).toThrow(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      });
    });

    describe('actions', () => {
      it('should return getLogger action', () => {
        const actions = plugin.hooks.actions(gasket);

        expect(actions.getLogger()).toBe(gasket.logger);
      });
    });

    describe('onSignal', () => {
      it('should close logger if available', async () => {
        const fakeLogger = { close: jest.fn() };
        gasket.logger = fakeLogger;

        await plugin.hooks.onSignal(gasket);

        expect(fakeLogger.close).toHaveBeenCalled();
      });

      it('should not throw error if logger is not available', async () => {
        await expect(plugin.hooks.onSignal(gasket)).resolves.not.toThrow();
      });
    });

    describe('metadata', () => {
      it('should return metadata with lifecycle information', () => {
        const meta = plugin.hooks.metadata(gasket, { otherData: 'example' });

        expect(meta).toEqual(
          expect.objectContaining({
            lifecycles: expect.arrayContaining([
              expect.objectContaining({
                name: 'createLogger',
                method: 'execSync',
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
