const middleware = require('../lib/middleware');

describe('middleware', function () {
  const { timing, handler } = middleware;
  let gasket;

  beforeEach(function () {
    gasket = {
      execWaterfall: jest.fn().mockResolvedValue([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry'
        },
        serviceWorker: {
          url: 'sw.js'
        }
      },
      logger: {
        debug: jest.fn()
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  describe('#timing', function () {

    it('is set to last', function () {
      expect(timing).toHaveProperty('last', true);
    });
  });

  describe('#handler', function () {

    it('is a function', function () {
      expect(typeof handler).toBe('function');
      expect(handler).toHaveLength(1);
    });

    it('returns middleware', function () {
      const fn = handler(gasket, {});
      expect(typeof fn).toBe('function');
      expect(fn).toHaveLength(3);
    });

    it('gathers manifest data if looking for manifest.json', async function () {
      const fn = handler(gasket, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, function () { });
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
    });

    it('gathers manifest data if looking for the service worker script', async function () {
      const fn = handler(gasket, {});
      const req = {
        path: 'sw.js'
      };
      await fn(req, {}, function () { });
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
    });

    it('passes the incoming request to the manifest hook', async function () {
      const fn = handler(gasket, {}, {});
      const context = { req: { path: 'manifest.json', manifest: [] }, res: {} };
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, function () { });
      expect(gasket.execWaterfall.mock.calls[0]).toHaveLength(3);
      expect(gasket.execWaterfall.mock.calls[0][2]).toEqual(context);
    });

    it('takes precedence from gasket config over base config', async function () {
      gasket.config.manifest.display = 'BOGUS';
      const fn = handler(gasket, {}, {});
      const req = {
        path: 'manifest.json'
      };
      await fn(req, {}, function () { });
      expect(gasket.execWaterfall.mock.calls[0][1].display).toEqual('BOGUS');
    });
  });
});
