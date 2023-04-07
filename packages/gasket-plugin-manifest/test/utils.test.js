const mockJoinStub = jest.fn();

jest.mock('path', () => ({
  join: mockJoinStub
}));

const { gatherManifestData } = require('../lib/utils');

describe('utils', function () {
  let gasket;

  beforeEach(function () {
    gasket = {
      execWaterfall: jest.fn().mockResolvedValue([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry',
          staticOutput: 'path/to/test.json'
        },
        serviceWorker: {
          url: 'sw.js'
        }
      },
      logger: {
        debug: jest.fn()
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  describe('#gatherManifestData', function () {
    it('is a function', function () {
      expect(typeof gatherManifestData).toBe('function');
      expect(gatherManifestData).toHaveLength(2);
    });

    it('uses static source when no url supplied', async function () {
      await gatherManifestData(gasket, {});
      expect(gasket.logger.debug).toHaveBeenCalledTimes(1);
      expect(gasket.logger.debug.mock.calls[0][0]).toEqual('Gathering manifest for static manifest');
    });

    it('uses req url as source', async function () {
      const req = {
        originalUrl: 'www.originalurl.com'
      };
      await gatherManifestData(gasket, { req });
      expect(gasket.logger.debug).toHaveBeenCalledTimes(1);
      expect(gasket.logger.debug.mock.calls[0][0]).toEqual('Gathering manifest for www.originalurl.com');
    });

    it('does not include staticOutput in manifest file', async function () {
      await gatherManifestData(gasket, {});
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall.mock.calls[0][1]).not.toContain('staticOutput');
    });

    it('does not include false staticOutput in manifest', async function () {
      gasket.config.manifest.staticOutput = false;
      await gatherManifestData(gasket, {});
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall.mock.calls[0][1]).not.toContain('staticOutput');
    });

    it('does not include path manifest', async function () {
      gasket.config.manifest.path = '/custom/manifest.json';
      await gatherManifestData(gasket, {});
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall.mock.calls[0][1]).not.toContain('path');
    });

    it('calls manifest waterfall', async function () {
      await gatherManifestData(gasket, {});
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);
    });
  });
});
