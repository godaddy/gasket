const mockJoinStub = jest.fn();

jest.mock('path', () => ({
  join: mockJoinStub
}));

const configure = require('../lib/configure');
const baseConfig = require('../lib/base-config');

describe('configure', function () {
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
        },
        root: 'test/'
      },
      logger: {
        debug: jest.fn()
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is a function', function () {
    expect(typeof configure).toBe('function');
    expect(configure).toHaveLength(1);
  });

  it('merges base config with the manifest config', function () {
    const scope = '/custom';
    const config = { manifest: { scope } };

    const results = configure(gasket, config);

    expect(results.manifest).toEqual(
      { ...baseConfig, scope }
    );
  });

  it('works with defaults when not configured', function () {
    const config = {};

    const results = configure(gasket, config);

    expect(results.manifest).toEqual(baseConfig);
  });

  it('uses default path when staticOutput is true', function () {
    const staticOutput = true;
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    expect(mockJoinStub.mock.calls[0][1]).toEqual('public/manifest.json');
  });

  it('uses custom path when passed from manifest', function () {
    const staticOutput = 'custom/path/manifest.json';
    const config = { manifest: { staticOutput } };

    configure(gasket, config);

    expect(mockJoinStub.mock.calls[0][1]).toEqual(staticOutput);
  });

  it('sets static output to false when not configured', function () {
    configure(gasket, { manifest: {} });
    expect(mockJoinStub).not.toHaveBeenCalled();
  });
});
