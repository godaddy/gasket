const path = require('path');

describe('req.getNextRoute()', () => {
  let req, gasket, getNextRoute;

  beforeEach(() => {
    gasket = {
      config: {
        root: ''
      },
      logger: {
        warn: jest.fn()
      }
    };

    req = { url: '/' };

    getNextRoute = require('../lib/next-route');
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('returns null if a valid routes manifest could not be found', async () => {
    gasket.config.root = __dirname;

    const route = await getNextRoute(gasket, req);

    expect(route).toBeNull();
  });

  describe('if a valid .next/routes-manifest.json exists', () => {
    beforeEach(() => {
      gasket.config.root = path.resolve(__dirname, './mock-repo');
    });

    it('returns null if the URL does not match a route', async () => {
      req.url = '/does/not/exist';

      const route = await getNextRoute(gasket, req);

      expect(route).toBeNull();
    });

    it('returns a static route if there is a match', async () => {
      req.url = '/purge-documents';

      const route = await getNextRoute(gasket, req);

      expect(route).not.toBeNull();
      expect(route.page).toEqual('/purge-documents');
    });

    it('returns a dynamic route if there is a match', async () => {
      req.url = '/plans/cohorts/US%20Only';

      const route = await getNextRoute(gasket, req);

      expect(route).not.toBeNull();
      expect(route.page).toEqual('/plans/cohorts/[cohort]');
      expect(route.namedRegex.exec(req.url).groups.cohort).toEqual('US%20Only');
    });
  });
});
