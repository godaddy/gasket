import { makeGasket } from '@gasket/core';
import PluginLogger from '@gasket/plugin-logger';
import plugin from '../lib/index.js';
import { LEVEL, MESSAGE } from 'triple-beam';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');
import { vi } from 'vitest';
import { createLogger, format, config as winstonConfig } from 'winston';

vi.mock('winston', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, createLogger: vi.fn(actual.createLogger) };
});

const defaultLevels = Object.assign({ fatal: 0, warn: 4, trace: 7 }, winstonConfig.syslog.levels);

// Mock console methods
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'log').mockImplementation(() => { });

describe('@gasket/plugin-winston', function () {
  let gasket;

  beforeEach(() => {
    gasket = makeGasket({ plugins: [PluginLogger, plugin] });
    gasket.config = { env: 'local' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  describe('create hook', function () {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        pkg: {
          add: vi.fn()
        },
        gasketConfig: {
          addPlugin: vi.fn()
        }
      };
    });

    it('adds itself to the dependencies', async function () {
      gasket.execSync('create', mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({
          [name]: `^${version}`
        }));
    });

    it('adds the expected dependencies', async function () {
      gasket.execSync('create', mockContext);

      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({
          winston: require('../package.json').dependencies.winston
        }));
    });

    it('adds plugin import to the gasket file', async function () {
      gasket.execSync('create', mockContext);
      expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginWinston', name);
    });
  });

  describe('createLogger hook', function () {
    it('creates a logger', function () {
      const [logger] = gasket.execSync('createLogger');

      expect(logger).toBeDefined();
      expect(logger).not.toEqual(null);
      expect(typeof logger).toEqual('object');
      expect(logger).toHaveProperty('error');
    });

    it('uses the console as the default transport', function () {
      const consoleSpy = vi
        // eslint-disable-next-line no-console
        .spyOn(console._stdout, 'write')
        .mockImplementation();
      try {
        const [logger] = gasket.execSync('createLogger');

        logger.error('test');

        expect(consoleSpy).toHaveBeenCalledWith('error: test\n');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('defaults to json format when env is not local', function () {
      gasket.config.env = 'prod';
      const consoleSpy = vi
        // eslint-disable-next-line no-console
        .spyOn(console._stdout, 'write')
        .mockImplementation();
      try {
        const [logger] = gasket.execSync('createLogger');

        logger.error('test');

        expect(consoleSpy).toHaveBeenCalledWith(
          JSON.stringify({
            level: 'error',
            message: 'test'
          }) + '\n'
        );
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('allows custom levels', function () {
      gasket.config.winston = {
        levels: {
          critical: 0,
          awesome: 4,
          bogus: 7
        }
      };
      const [logger] = gasket.execSync('createLogger');

      expect(logger).toBeDefined();
      expect(logger).not.toEqual(null);
      expect(typeof logger).toEqual('object');
      expect(logger).toHaveProperty('critical');
      expect(logger).toHaveProperty('awesome');
      expect(logger).toHaveProperty('bogus');
    });

    it('allows custom formats', function () {
      const customFormat = {
        transform: vi.fn((info) => info)
      };
      gasket.config.winston = {
        format: customFormat
      };

      const [logger] = gasket.execSync('createLogger');

      expect(logger).toBeDefined();
      expect(logger).not.toEqual(null);
      expect(typeof logger).toEqual('object');

      logger.info('test 123');
      expect(customFormat.transform).toHaveBeenCalledWith(expect.objectContaining({
        level: 'info',
        message: 'test 123'
      }), expect.undefined);
    });

    describe('winstonLevels', () => {
      function passedLevels() {
        return createLogger.mock.calls.at(-1)[0].levels;
      }

      it('passes the default levels when no hook is registered', function () {
        gasket.execSync('createLogger');
        expect(passedLevels()).toEqual(defaultLevels);
      });

      it('passes the app levels unchanged when no hook is registered', function () {
        const levels = { critical: 0, awesome: 4 };
        gasket.config.winston = { levels };
        gasket.execSync('createLogger');
        expect(passedLevels()).toBe(levels);
      });

      it('adds a contributed level and keeps the default levels', function () {
        gasket.hook({ event: 'winstonLevels', handler: () => ({ security: 3 }) });
        const [logger] = gasket.execSync('createLogger');

        expect(passedLevels()).toEqual({ ...defaultLevels, security: 3 });
        expect(logger).toHaveProperty('security');
        expect(logger).toHaveProperty('fatal');
        expect(logger).toHaveProperty('trace');
      });

      it('adds a contributed level to the app levels', function () {
        gasket.config.winston = { levels: { critical: 0, awesome: 4 } };
        gasket.hook({ event: 'winstonLevels', handler: () => ({ security: 3 }) });
        const [logger] = gasket.execSync('createLogger');

        expect(passedLevels()).toEqual({ critical: 0, awesome: 4, security: 3 });
        expect(logger).toHaveProperty('critical');
        expect(logger).toHaveProperty('security');
      });

      it('lets a later hook win on a level collision', function () {
        gasket.hook({ event: 'winstonLevels', handler: () => ({ security: 3 }) });
        gasket.hook({ event: 'winstonLevels', handler: () => ({ security: 5 }) });
        gasket.execSync('createLogger');

        expect(passedLevels().security).toBe(5);
      });

      it('ignores a hook that returns nothing', function () {
        const levels = { critical: 0, awesome: 4 };
        gasket.config.winston = { levels };
        gasket.hook({ event: 'winstonLevels', handler: () => null });
        gasket.execSync('createLogger');

        expect(passedLevels()).toBe(levels);
      });
    });

    describe('winstonFormats', () => {
      function passedFormat() {
        return createLogger.mock.calls.at(-1)[0].format;
      }

      it('passes the app format unchanged when no hook is registered', function () {
        const customFormat = format((info) => info)();
        gasket.config.winston = { format: customFormat };
        gasket.execSync('createLogger');

        expect(passedFormat()).toBe(customFormat);
      });

      it('runs a contributed format before the app format', function () {
        const calls = [];
        const baseFormat = format((info) => {
          calls.push('base');
          return info;
        })();
        gasket.config.winston = { format: baseFormat };
        gasket.hook({
          event: 'winstonFormats',
          handler: () => format((info) => {
            calls.push('hook');
            return info;
          })()
        });
        const [logger] = gasket.execSync('createLogger');

        logger.info('test');
        expect(calls).toEqual(['hook', 'base']);
      });

      it('enriches the entry before the default format serializes it', function () {
        gasket.config.env = 'prod';
        gasket.hook({
          event: 'winstonFormats',
          handler: () => format((info) => ({ ...info, tag: 'added' }))()
        });
        const consoleSpy = vi
          // eslint-disable-next-line no-console
          .spyOn(console._stdout, 'write')
          .mockImplementation();
        try {
          const [logger] = gasket.execSync('createLogger');

          logger.error('test');

          expect(consoleSpy).toHaveBeenCalledWith(
            JSON.stringify({ level: 'error', message: 'test', tag: 'added' }) + '\n'
          );
        } finally {
          consoleSpy.mockRestore();
        }
      });

      it('ignores a hook that returns nothing', function () {
        const customFormat = format((info) => info)();
        gasket.config.winston = { format: customFormat };
        gasket.hook({ event: 'winstonFormats', handler: () => false });
        gasket.execSync('createLogger');

        expect(passedFormat()).toBe(customFormat);
      });
    });

    describe('custom transports', () => {
      let transport1;
      let transport2;

      beforeEach(() => {
        transport1 = {
          log: vi.fn(),
          on: vi.fn()
        };

        transport2 = {
          write: vi.fn(),
          log: vi.fn(),
          on: vi.fn()
        };
      });

      it('can be injected individually via hook', function () {
        gasket.hook({ event: 'winstonTransports', handler: () => transport1 });
        const [logger] = gasket.execSync('createLogger');

        logger.error('test');

        expect(transport1.log).toHaveBeenCalledWith(
          'error',
          'test',
          {
            level: 'error',
            message: 'test',
            [LEVEL]: 'error',
            [MESSAGE]: 'error: test'
          },
          expect.any(Function)
        );
      });

      it('can be injected individually via config', function () {
        gasket.config.winston = { transports: transport1 };

        const [logger] = gasket.execSync('createLogger');
        logger.error('test');

        expect(transport1.log).toHaveBeenCalledWith(
          'error',
          'test',
          {
            level: 'error',
            message: 'test',
            [LEVEL]: 'error',
            [MESSAGE]: 'error: test'
          },
          expect.any(Function)
        );
      });

      it('can be injected via hook', function () {
        gasket.hook({
          event: 'winstonTransports',
          handler: () => [transport1, transport2]
        });
        const [logger] = gasket.execSync('createLogger');

        logger.error('test');

        [transport1.log, transport2.log].forEach((writer) => {
          expect(writer).toHaveBeenCalledWith(
            'error',
            'test',
            {
              level: 'error',
              message: 'test',
              [LEVEL]: 'error',
              [MESSAGE]: 'error: test'
            },
            expect.any(Function)
          );
        });
      });

      it('can be injected via config', function () {
        gasket.config.winston = { transports: [transport1, transport2] };
        const [logger] = gasket.execSync('createLogger');

        logger.error('test');

        [transport1.log, transport2.log].forEach((writer) => {
          expect(writer).toHaveBeenCalledWith(
            'error',
            'test',
            {
              level: 'error',
              message: 'test',
              [LEVEL]: 'error',
              [MESSAGE]: 'error: test'
            },
            expect.any(Function)
          );
        });
      });
    });
  });

  describe('metadata hook', function () {
    it('adds the expected lifecycles', async function () {
      const [, meta] = await gasket.exec('metadata', {
        name: '@gasket/plugin-winston',
        module: {}
      });

      expect(meta.lifecycles).toEqual(
        expect.arrayContaining([
          {
            name: 'winstonTransports',
            method: 'execSync',
            description: 'Setup Winston log transports',
            link: 'README.md#winstonTransports',
            parent: 'createLogger'
          },
          {
            name: 'winstonLevels',
            method: 'execSync',
            description: 'Add Winston log levels',
            link: 'README.md#winstonLevels',
            parent: 'createLogger'
          },
          {
            name: 'winstonFormats',
            method: 'execSync',
            description: 'Add Winston log formats',
            link: 'README.md#winstonFormats',
            parent: 'createLogger'
          }
        ])
      );
    });

    it('adds the expected config sections', async function () {
      const [, meta] = await gasket.exec('metadata', {
        name: '@gasket/plugin-winston',
        module: {}
      });

      expect(meta.configurations).toEqual(
        expect.arrayContaining([
          {
            name: 'winston',
            link: 'README.md#configuration',
            description: 'Setup and customize winston logger',
            type: 'object'
          }
        ])
      );
    });
  });
});
