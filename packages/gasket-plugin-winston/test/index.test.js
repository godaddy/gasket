/* eslint-disable no-sync */
const { GasketEngine } = require('@gasket/core');
const PluginLogger = require('@gasket/plugin-logger');
const plugin = require('../lib/index');
const { LEVEL, MESSAGE } = require('triple-beam');
const { name, version } = require('../package.json');

// Mock console methods
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('@gasket/plugin-winston', function () {
  let gasket;

  beforeEach(() => {
    gasket = new GasketEngine([PluginLogger, plugin]);
    gasket.config = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has the expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  describe('create hook', function () {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        pkg: {
          add: jest.fn()
        },
        gasketConfig: {
          addPlugin: jest.fn()
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
          winston: require('../package').dependencies.winston
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
      const consoleSpy = jest
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

    describe('custom transports', () => {
      let transport1;
      let transport2;

      beforeEach(() => {
        transport1 = {
          log: jest.fn(),
          on: jest.fn()
        };

        transport2 = {
          write: jest.fn(),
          log: jest.fn(),
          on: jest.fn()
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
            [MESSAGE]: JSON.stringify({
              level: 'error',
              message: 'test'
            })
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
            [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
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
              [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
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
              [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
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
