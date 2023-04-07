const serve = require('../lib/serve');

describe('serve', function () {
  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is a function', function () {
    expect(typeof serve).toBe('function');
    expect(serve).toHaveLength(2);
  });

  it('adds a route to the express/fastify server', async function () {
    const app = {
      get: jest.fn()
    };

    await serve({}, app);
    expect(app.get).toHaveBeenCalledTimes(1);
  });

  it('returns the configured manifest on the route /manifest.json when path option is not set', async function () {
    const stub = jest.fn();
    const get = function (route, f) {
      expect(route).toEqual('/manifest.json');
      f({}, { send: stub });
      expect(stub).toHaveBeenCalledTimes(1);
    };

    const app = { get };
    await serve({}, app);
  });

  it('returns the configured manifest on the configured path if option is set', async function () {
    const customPath = '/some/custom/path';
    const gasket = {
      config: {
        manifest: {
          path: customPath
        }
      }
    };

    const stub = jest.fn();
    const get = function (route, f) {
      expect(route).toEqual(customPath);
      f({}, { send: stub });
      expect(stub).toHaveBeenCalledTimes(1);
    };

    const app = { get };
    await serve(gasket, app);
  });
});
