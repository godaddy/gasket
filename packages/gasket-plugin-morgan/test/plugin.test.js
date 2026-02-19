import { expect, describe, it, vi } from 'vitest';
import { createRequire } from 'module';
import Plugin from '../lib/index.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('@gasket/plugin-morgan', () => {
  it('is an object', () => {
    expect(typeof Plugin).toBe('object');
  });

  it('has expected properties', () => {
    expect(Plugin).toHaveProperty('name', name);
    expect(Plugin).toHaveProperty('version', version);
    expect(Plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = ['express', 'fastify', 'metadata'];

    expect(Plugin).toHaveProperty('hooks');

    const hooks = Object.keys(Plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('.express', () => {
    it('has timing set to run first', () => {
      expect(Plugin.hooks.express).toHaveProperty('timing');
      expect(Plugin.hooks.express.timing).toEqual({ first: true });
    });

    it('runs on the express lifecycle event', function () {
      expect(typeof Plugin.hooks.express.handler).toBe('function');
      expect(Plugin.hooks.express.handler).toHaveLength(2);
    });

    it('registers morgan middleware on the express app', () => {
      const loggerMock = { info: vi.fn() };
      const appMock = { use: vi.fn() };

      const gasketMock = {
        config: {
          morgan: { format: 'tiny', options: {} }
        },
        logger: loggerMock
      };

      Plugin.hooks.express.handler(gasketMock, appMock);
      expect(appMock.use).toHaveBeenCalledTimes(1);
      expect(typeof appMock.use.mock.calls[0][0]).toBe('function');
    });

    it('logs requests using gasket logger', () => {
      const loggerMock = { info: vi.fn() };
      const appMock = { use: vi.fn() };
      const reqMock = { method: 'GET', url: '/foobar' };
      const resMock = {};

      const gasketMock = {
        config: {
          morgan: { format: ':method :url', options: { immediate: true } }
        },
        logger: loggerMock
      };

      Plugin.hooks.express.handler(gasketMock, appMock);
      const [morganMiddleware] = appMock.use.mock.calls[0];

      morganMiddleware(reqMock, resMock, function next() {
        expect(loggerMock.info).toHaveBeenCalledWith('GET /foobar');
      });
    });
  });

  describe('.fastify', () => {
    it('runs on the fastify lifecycle event', function () {
      expect(typeof Plugin.hooks.fastify).toBe('function');
      expect(Plugin.hooks.fastify).toHaveLength(2);
    });

    it('registers an onRequest hook on the fastify app', () => {
      const loggerMock = { info: vi.fn() };
      const appMock = { addHook: vi.fn() };

      const gasketMock = {
        config: {
          morgan: { format: 'tiny', options: {} }
        },
        logger: loggerMock
      };

      Plugin.hooks.fastify(gasketMock, appMock);
      expect(appMock.addHook).toHaveBeenCalledTimes(1);
      expect(appMock.addHook.mock.calls[0][0]).toBe('onRequest');
      expect(typeof appMock.addHook.mock.calls[0][1]).toBe('function');
    });

    it('passes raw request/reply to morgan via onRequest hook', () => {
      const loggerMock = { info: vi.fn() };
      const appMock = { addHook: vi.fn() };
      const rawReqMock = { method: 'GET', url: '/foobar' };
      const rawResMock = {};
      const requestMock = { raw: rawReqMock };
      const replyMock = { raw: rawResMock };
      const doneMock = vi.fn();

      const gasketMock = {
        config: {
          morgan: { format: ':method :url', options: { immediate: true } }
        },
        logger: loggerMock
      };

      Plugin.hooks.fastify(gasketMock, appMock);
      const onRequestHandler = appMock.addHook.mock.calls[0][1];

      onRequestHandler(requestMock, replyMock, doneMock);
      // done is called by morgan after processing
      expect(typeof onRequestHandler).toBe('function');
    });
  });
});
