import { Writable } from 'node:stream';
import type Transport from 'winston-transport';
import { LEVEL, MESSAGE, } from 'triple-beam';
import GasketEngine, { Gasket } from '@gasket/engine';
import plugin from '../src';

describe('@gasket/plugin-winston', function () {
  let gasket: Gasket

  beforeEach(() => {
    gasket = new GasketEngine({
      plugins: {
        add: ['@gasket/plugin-logger', plugin]
      }
    }) as Gasket;
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
    it('adds the expected dependencies', async function () {
      const spy = {
        pkg: {
          add: jest.fn()
        }
      } as any;

      await gasket.exec('create', spy);

      expect(spy.pkg.add).toBeCalledWith(
        'dependencies',
        { winston: require('../package').dependencies.winston }
      );
    });
  });

  describe('createLogger hook', function () {
    it('creates a logger', async function () {
      const [logger] = await gasket.exec('createLogger');

      expect(logger).toBeDefined();
      expect(logger).not.toEqual(null);
      expect(typeof logger).toEqual('object');
      expect(logger).toHaveProperty('error');
    });

    it('uses the console as the default transport', async function () {
      //@ts-ignore
      const consoleSpy = jest.spyOn(console._stdout, 'write').mockImplementation();
      try {
        const [logger] = await gasket.exec('createLogger');

        logger.error('test');
  
        expect(consoleSpy).toBeCalledWith(JSON.stringify({
          level: 'error',
          message: 'test'
        }) + '\n');  
      } finally {
        consoleSpy.mockRestore();
      }
    });

    describe('custom transports', () => {
      let transportWriter1: jest.Mock, transport1: Transport;
      let transportWriter2: jest.Mock, transport2: Transport;

      beforeEach(() => {
        transportWriter1 = jest.fn();
        transport1 = Object.assign(
          new Writable({ write: transportWriter1, objectMode: true }),
          { log: jest.fn() });
  
        transportWriter2 = jest.fn();
        transport2 = Object.assign(
          new Writable({ write: transportWriter2, objectMode: true }),
          { log: jest.fn() });
      });

      it('can be injected individually via hook', async function () {
        gasket.hook({ event: 'logTransports', handler: () => transport1 });
        const [logger] = await gasket.exec('createLogger');
  
        logger.error('test');
  
        expect(transportWriter1).toBeCalledWith(
          {
            level: 'error',
            message: 'test',
            [LEVEL]: 'error',
            [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
          },
          'utf8',
          expect.any(Function));
      });
  
      it('can be injected individually via config', async function () {
        gasket.config.winston = { transports: transport1 };
  
        const [logger] = await gasket.exec('createLogger');
        logger.error('test');
  
        expect(transportWriter1).toBeCalledWith(
          {
            level: 'error',
            message: 'test',
            [LEVEL]: 'error',
            [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
          },
          'utf8',
          expect.any(Function));
      });
  
      it('can be injected via hook', async function () {
        gasket.hook({ event: 'logTransports', handler: () => [transport1, transport2] });
        const [logger] = await gasket.exec('createLogger');
  
        logger.error('test');
  
        [transportWriter1, transportWriter2].forEach(writer => {
          expect(writer).toBeCalledWith(
            {
              level: 'error',
              message: 'test',
              [LEVEL]: 'error',
              [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
            },
            'utf8',
            expect.any(Function)
          );
        });
      });
  
      it('can be injected via config', async function () {
        gasket.config.winston = { transports: [transport1, transport2] };
        const [logger] = await gasket.exec('createLogger');
  
        logger.error('test');
  
        [transportWriter1, transportWriter2].forEach(writer => {
          expect(writer).toBeCalledWith(
            {
              level: 'error',
              message: 'test',
              [LEVEL]: 'error',
              [MESSAGE]: JSON.stringify({ level: 'error', message: 'test' })
            },
            'utf8',
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
        expect.arrayContaining([{
          name: 'logTransports',
          method: 'exec',
          description: 'Setup Winston log transports',
          link: 'README.md#logTransports',
          parent: 'createLogger'
        }])
      );
    });

    it('adds the expected config sections', async function () {
      const [, meta] = await gasket.exec('metadata', {
        name: '@gasket/plugin-winston',
        module: {}
      });

      expect(meta.configurations).toEqual(
        expect.arrayContaining([{
          name: 'winston',
          link: 'README.md#configuration',
          description: 'Setup and customize winston logger',
          type: 'object'
        }])
      );
    });
  });
});
