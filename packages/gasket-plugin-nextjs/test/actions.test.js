// Set up module cache stubs so actions.js uses these instances
const configPath = require.resolve('../lib/utils/config.js');
const nextRoutePath = require.resolve('../lib/utils/next-route.js');

const mockCreateConfig = vi.fn();
const mockNextRoute = vi.fn();

require.cache[configPath] = {
  id: configPath,
  filename: configPath,
  loaded: true,
  exports: { createConfig: mockCreateConfig }
};
require.cache[nextRoutePath] = {
  id: nextRoutePath,
  filename: nextRoutePath,
  loaded: true,
  exports: mockNextRoute
};

// Import after stubbing cache
const actions = require('../lib/actions');

// Get references to the mocked functions (same instances as used by actions)
const { createConfig } = require(configPath);
const nextRoute = require(nextRoutePath);

describe('actions', () => {
  let mockGasket, isReadySpy;

  beforeEach(() => {
    isReadySpy = vi.fn();

    vi.clearAllMocks();

    mockGasket = {
      get isReady() {
        isReadySpy();
        return Promise.resolve();
      },
      config: {
        root: '/path/to/app'
      },
      execWaterfall: vi.fn((_, config) => config),
      logger: {
        warn: vi.fn()
      }
    };
  });

  it('has expected actions', () => {
    expect(actions).toMatchObject({
      getNextConfig: expect.any(Function),
      getNextRoute: expect.any(Function)
    });
  });

  describe('getNextConfig', () => {
    it('returns a setup function', () => {
      const setup = actions.getNextConfig(mockGasket, {});
      expect(setup).toEqual(expect.any(Function));
    });

    it('setup awaits gasket.isReady', async () => {
      const setup = actions.getNextConfig(mockGasket, {});
      await setup('MOCK_PHASE', { defaultConfig: {} });
      expect(isReadySpy).toHaveBeenCalled();
    });

    it('calls createConfig with passed next config', async () => {
      const defaultConfig = {};
      const mockConfig = { example: 'config' };

      const setup = actions.getNextConfig(mockGasket, mockConfig);
      await setup('MOCK_PHASE', { defaultConfig });

      expect(createConfig).toHaveBeenCalledWith(mockGasket, mockConfig);
    });

    it('setup executes nextConfig function if provided', async () => {
      const defaultConfig = {};
      const mockConfig = { example: 'config' };
      const nextConfigSpy = vi.fn(() => mockConfig);

      const setup = actions.getNextConfig(mockGasket, nextConfigSpy);
      await setup('MOCK_PHASE', { defaultConfig });

      expect(nextConfigSpy).toHaveBeenCalledWith('MOCK_PHASE', { defaultConfig });
      expect(createConfig).toHaveBeenCalledWith(mockGasket, mockConfig);
    });
  });

  describe('getNextRoute', () => {
    it('awaits gasket.isReady', async () => {
      await actions.getNextRoute(mockGasket, {});
      expect(isReadySpy).toHaveBeenCalled();
    });

    it('calls nextRoute with gasket and req', async () => {
      const req = {};
      await actions.getNextRoute(mockGasket, req);
      expect(nextRoute).toHaveBeenCalledWith(mockGasket, req);
    });
  });
});
