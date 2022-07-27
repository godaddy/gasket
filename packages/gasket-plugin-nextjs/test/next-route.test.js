const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const assume = require('assume');
const { spy } = require('sinon');

describe('req.getNextRoute()', () => {
  let getNextRoute, req, gasket;

  beforeEach(() => {
    gasket = {
      config: {
        root: ''
      },
      logger: {
        warn: spy()
      }
    };

    req = { url: '/' };

    getNextRoute = proxyquire('../lib/next-route', {});
  });

  it('returns null if a valid routes manifest could not be found', async () => {
    gasket.config.root = __dirname;

    const route = await getNextRoute(gasket, req);

    assume(route).equals(null);
  });

  describe('if a valid .next/routes-manifest.json exists', () => {
    beforeEach(() => {
      gasket.config.root = path.resolve(__dirname, './mock-repo');
    });

    it('returns null if the URL does not match a route', async () => {
      req.url = '/does/not/exist';

      const route = await getNextRoute(gasket, req);

      assume(route).equals(null);
    });

    it('returns a static route if there is a match', async () => {
      req.url = '/purge-documents';

      const route = await getNextRoute(gasket, req);

      assume(route).does.not.equal(null);
      assume(route.page).equals('/purge-documents');
    });

    it('returns a dynamic route if there is a match', async () => {
      req.url = '/plans/cohorts/US%20Only';

      const route = await getNextRoute(gasket, req);

      assume(route).does.not.equal(null);
      assume(route.page).equals('/plans/cohorts/[cohort]');
      assume(route.namedRegex.exec(req.url).groups.cohort).equals('US%20Only');
    });
  });
});
