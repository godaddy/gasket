import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

describe('next-route', () => {
  let gasket, req, getNextRoute;

  beforeEach(async () => {
    // Reset modules and get fresh import
    vi.resetModules();
    const module = await import('../lib/utils/next-route.js');
    getNextRoute = module.default;

    gasket = {
      config: {
        root: path.join(dirName, 'mock-repo')
      },
      logger: {
        warn: vi.fn()
      }
    };

    req = { path: '/', url: '/' };
  });


  it('returns null if a valid routes manifest could not be found', async () => {
    gasket.config.root = dirName;

    const route = await getNextRoute(gasket, req);

    expect(route).toBeNull();
  });

  describe('if a valid .next/routes-manifest.json exists', () => {
    beforeEach(() => {
      gasket.config.root = path.resolve(dirName, './mock-repo');
    });

    it('returns null if the URL does not match a route', async () => {
      req.path = '/does/not/exist';

      const route = await getNextRoute(gasket, req);

      expect(route).toBeNull();
    });

    it('returns a static route if there is a match', async () => {
      req.path = '/purge-documents';

      const route = await getNextRoute(gasket, req);

      expect(route).not.toBeNull();
      expect(route.page).toEqual('/purge-documents');
    });

    it('returns a dynamic route if there is a match', async () => {
      req.path = '/plans/cohorts/US%20Only';

      const route = await getNextRoute(gasket, req);

      expect(route).not.toBeNull();
      expect(route.page).toEqual('/plans/cohorts/[cohort]');
      expect(route.namedRegex.exec(req.path).groups.cohort).toEqual('US%20Only');
    });

    it('returns valid static route if url has query param', async () => {
      req.path = '/plans/cohorts/US%20Only';

      const route = await getNextRoute(gasket, req);

      expect(route).not.toBeNull();
      expect(route.page).toEqual('/plans/cohorts/[cohort]');
      expect(route.namedRegex.exec(req.path).groups.cohort).toEqual('US%20Only');
    });

    it('returns correct route for static path', async () => {
      const route = await getNextRoute(gasket, { path: '/plans' });
      expect(route.page).toEqual('/plans');
    });
  });
});
