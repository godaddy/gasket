const mockCreateConfig = vi.fn();
const mockNextRoute = vi.fn();

// Mock the utility modules before importing actions
vi.mock('../lib/utils/config.js', () => ({
  createConfig: mockCreateConfig
}));

vi.mock('../lib/utils/next-route.js', () => ({
  default: mockNextRoute
}));

// Import after mocking
const { getNextConfig, getNextRoute } = await import('../lib/actions.js');

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
    expect(getNextConfig).toEqual(expect.any(Function));
    expect(getNextRoute).toEqual(expect.any(Function));
  });

  describe('getNextConfig', () => {
    it('returns a setup function', () => {
      const setup = getNextConfig(mockGasket, {});
      expect(setup).toEqual(expect.any(Function));
    });

    it('setup awaits gasket.isReady', async () => {
      const setup = getNextConfig(mockGasket, {});
      await setup('MOCK_PHASE', { defaultConfig: {} });
      expect(isReadySpy).toHaveBeenCalled();
    });

    it('calls createConfig with passed next config', async () => {
      const defaultConfig = {};
      const mockConfig = { example: 'config' };

      const setup = getNextConfig(mockGasket, mockConfig);
      await setup('MOCK_PHASE', { defaultConfig });

      expect(mockCreateConfig).toHaveBeenCalledWith(mockGasket, mockConfig);
    });

    it('setup executes nextConfig function if provided', async () => {
      const defaultConfig = {};
      const mockConfig = { example: 'config' };
      const nextConfigSpy = vi.fn(() => mockConfig);

      const setup = getNextConfig(mockGasket, nextConfigSpy);
      await setup('MOCK_PHASE', { defaultConfig });

      expect(nextConfigSpy).toHaveBeenCalledWith('MOCK_PHASE', { defaultConfig });
      expect(mockCreateConfig).toHaveBeenCalledWith(mockGasket, mockConfig);
    });
  });

  describe('getNextRoute', () => {
    it('awaits gasket.isReady', async () => {
      await getNextRoute(mockGasket, {});
      expect(isReadySpy).toHaveBeenCalled();
    });

    it('calls nextRoute with gasket and req', async () => {
      const req = {};
      await getNextRoute(mockGasket, req);
      expect(mockNextRoute).toHaveBeenCalledWith(mockGasket, req);
    });
  });
});
