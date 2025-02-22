jest.mock('../lib/./utils/config');
jest.mock('../lib/./utils/next-route');

const actions = require('../lib/actions');
const { createConfig } = require('../lib/utils/config');
const nextRoute = require('../lib/utils/next-route');

describe('actions', () => {
  let mockGasket, isReadySpy;

  beforeEach(() => {
    isReadySpy = jest.fn();

    mockGasket = {
      get isReady() {
        isReadySpy();
        return Promise.resolve();
      },
      config: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has expected actions', () => {
    const results = actions;
    expect(results).toHaveProperty('getNextConfig');
    expect(results).toHaveProperty('getNextRoute');
  });

  describe('getNextConfig', () => {

    it('returns a setup function', () => {
      const results = actions.getNextConfig();
      expect(typeof results).toEqual('function');
    });

    it('setup awaits gasket.isReady', async () => {
      const setup = actions.getNextConfig(mockGasket);
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

      const nextConfigSpy = jest.fn();
      const nextConfigFn = (...args) => {
        nextConfigSpy(...args);
        return mockConfig;
      };

      const setup = actions.getNextConfig(mockGasket, nextConfigFn);
      await setup('MOCK_PHASE', { defaultConfig });
      expect(nextConfigSpy).toHaveBeenCalledWith('MOCK_PHASE', { defaultConfig });

      expect(createConfig).toHaveBeenCalledWith(mockGasket, mockConfig);
    });
  });

  describe('getNextRoute', () => {
    it('awaits gasket.isReady', () => {
      actions.getNextRoute(mockGasket, {});
      expect(isReadySpy).toHaveBeenCalled();
    });

    it('calls nextRoute with gasket and req', async () => {
      const req = {};
      await actions.getNextRoute(mockGasket, req);
      expect(nextRoute).toHaveBeenCalledWith(mockGasket, req);
    });
  });
});
