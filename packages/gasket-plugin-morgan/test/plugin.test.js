const Plugin = require('../lib/index');
const { name, version, description } = require('../package');

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
    const expected = ['middleware', 'metadata'];

    expect(Plugin).toHaveProperty('hooks');

    const hooks = Object.keys(Plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  describe('.middleware', () => {

    it('runs on the middleware lifecycle event', function () {
      expect(typeof Plugin.hooks.middleware).toBe('function');
      expect(Plugin.hooks.middleware).toHaveLength(1);
    });

    it('returns a morgan middleware', () => {
      const loggerMock = { info: jest.fn() };

      const gasketMock = {
        config: {
          morgan: { format: 'tiny', options: {} }
        },
        logger: loggerMock
      };

      const returnValue = Plugin.hooks.middleware(gasketMock);
      expect(Array.isArray(returnValue)).toBe(true);
      expect(typeof returnValue[0]).toBe('function');
      expect(returnValue[0]).toHaveLength(3);
    });

    it('logs requests using gasket logger', () => {
      const loggerMock = { info: jest.fn() };
      const reqMock = { method: 'GET', url: '/foobar' };
      const resMock = {};

      const gasketMock = {
        config: {
          morgan: { format: ':method :url', options: { immediate: true } }
        },
        logger: loggerMock
      };

      const [morganMiddleware] = Plugin.hooks.middleware(gasketMock);

      morganMiddleware(reqMock, resMock, function next() {
        expect(loggerMock.info).toHaveBeenCalledWith('GET /foobar');
      });
    });
  });
});
