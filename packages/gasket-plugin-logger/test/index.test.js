/* eslint-disable no-console */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import plugin from '../lib/index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

// Mock console methods
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'debug').mockImplementation(() => {});
vi.spyOn(console, 'trace').mockImplementation(() => {});

// Mock logger object
const mockLogger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  fatal: vi.fn(),
  trace: vi.fn(),
  child: vi.fn()
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
    let originalConsole;

    beforeEach(() => {
      gasket = {
        execSync: vi.fn(),
        logger: null,
        config: {}
      };

      originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log,
        info: console.info,
        debug: console.debug
      };
    });

    afterEach(() => {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
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
        const fakeLogger1 = { error: vi.fn() };
        const fakeLogger2 = { error: vi.fn() };
        gasket.execSync.mockReturnValue([fakeLogger1, fakeLogger2]);

        // eslint-disable-next-line max-nested-callbacks
        expect(() => plugin.hooks.init(gasket)).toThrow(
          'Multiple plugins are hooking createLogger. Only one logger is supported.'
        );
      });
    });

    describe('init - overrideConsole', () => {
      let fakeLogger;

      beforeEach(() => {
        fakeLogger = { ...mockLogger };
        gasket.execSync.mockReturnValue([fakeLogger]);
      });

      it('should not override console methods when overrideConsole is not set', () => {
        const originalLog = console.log;
        gasket.config = {};

        plugin.hooks.init(gasket);

        expect(console.log).toBe(originalLog);
      });

      it('should not override console methods when overrideConsole is false', () => {
        const originalLog = console.log;
        gasket.config = { logger: { overrideConsole: false } };

        plugin.hooks.init(gasket);

        expect(console.log).toBe(originalLog);
      });

      it('should not override console methods when no custom logger is hooked', () => {
        const originalLog = console.log;
        gasket.config = { logger: { overrideConsole: true } };
        gasket.execSync.mockReturnValue([]);

        plugin.hooks.init(gasket);

        expect(console.log).toBe(originalLog);
      });

      it('should override console methods when overrideConsole is true and a custom logger is hooked', () => {
        const originalLog = console.log;
        gasket.config = { logger: { overrideConsole: true } };

        plugin.hooks.init(gasket);

        expect(console.log).not.toBe(originalLog);
        expect(console.info).not.toBe(originalConsole.info);
        expect(console.error).not.toBe(originalConsole.error);
        expect(console.warn).not.toBe(originalConsole.warn);
        expect(console.debug).not.toBe(originalConsole.debug);
      });

      it('should route console.log to logger.info when overrideConsole is true', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.log('log message', { extra: 1 });

        expect(fakeLogger.info).toHaveBeenCalledWith('log message', { extra: 1 });
      });

      it('should route console.info to logger.info when overrideConsole is true', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.info('info message');

        expect(fakeLogger.info).toHaveBeenCalledWith('info message');
      });

      it('should route console.error to logger.error when overrideConsole is true', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.error('error message');

        expect(fakeLogger.error).toHaveBeenCalledWith('error message');
      });

      it('should route console.warn to logger.warn when overrideConsole is true', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.warn('warn message');

        expect(fakeLogger.warn).toHaveBeenCalledWith('warn message');
      });

      it('should route console.debug to logger.debug when overrideConsole is true', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.debug('debug message');

        expect(fakeLogger.debug).toHaveBeenCalledWith('debug message');
      });

      it('should forward multiple arguments through the overridden console methods', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        console.error('msg', 'extra', { key: 'value' });

        expect(fakeLogger.error).toHaveBeenCalledWith('msg', 'extra', { key: 'value' });
      });

      it('should log a confirmation message after overriding console', () => {
        gasket.config = { logger: { overrideConsole: true } };
        plugin.hooks.init(gasket);

        expect(fakeLogger.info).toHaveBeenCalledWith(
          '[gasket-plugin-logger] console overridden to use gasket.logger'
        );
      });
    });

    describe('actions', () => {
      it('should return getLogger action', () => {
        const actions = plugin.actions;

        expect(actions.getLogger(gasket)).toBe(gasket.logger);
      });
    });

    describe('onSignal', () => {
      it('should close logger if available', async () => {
        const fakeLogger = { close: vi.fn() };
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
