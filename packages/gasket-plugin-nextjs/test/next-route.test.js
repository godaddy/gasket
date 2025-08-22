const path = require('path');

const getNextRoute = require('../lib/utils/next-route');

describe('next-route', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      config: {
        root: path.join(__dirname, 'mock-repo')
      },
      logger: {
        warn: vi.fn()
      }
    };
  });

  it('returns correct route for static path', async () => {
    const route = await getNextRoute(gasket, { path: '/plans' });
    expect(route.page).toEqual('/plans');
  });
});
