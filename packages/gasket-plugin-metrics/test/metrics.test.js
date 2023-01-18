const path = require('path');
const os = require('os');
const Metrics = require('../lib/metrics');

const mockPackage = {
  name: 'mock-app',
  version: '7.8.9',
  dependencies: {
    '@gasket/engine': '1.2.3',
    '@gasket/plugin-example': '2.3.4',
    '@gasket/example-preset': '3.4.5'
  }
};

describe('Metrics', function () {
  let mockGasket, metrics;

  beforeEach(() => {
    mockGasket = {
      command: {
        id: 'test-command',
        flags: {
          record: true
        }
      },
      config: {
        root: path.join(__dirname, '..'),
        env: 'custom-env-set-here'
      },
      metadata: {
        app: {
          package: mockPackage
        }
      }
    };

    metrics = new Metrics(mockGasket);
  });

  describe('collect', function () {
    it('returns an object with', async function () {
      const data = await metrics.collect();

      expect(typeof data).toBe('object');
    });

    it('works in a directory without git', async function () {
      mockGasket.config.root = os.tmpdir();

      const parent = new Metrics(mockGasket);
      const data = await parent.collect();

      expect(typeof data).toBe('object');
      expect(typeof data.branch).toBe('undefined');
      expect(typeof data.repository).toBe('undefined');
    });

    it('includes git data', async function () {
      const data = await metrics.collect();

      //
      // Note that the branch test is a bit vague, but for a reason. Can't
      // check if it's master, because when working on new features we create
      // new branches locally, which would cause this test to fail.
      //
      expect(typeof data.branch).toBe('string');
      // TODO: Revert to `gasket.git` once actions/checkout bug is fixed
      expect(data.repository).toContain('gasket');
    });

    it('includes package from app metadata', async function () {
      const data = await metrics.collect();

      expect(data.name).toEqual(mockPackage.name);
      expect(data.version).toEqual(mockPackage.version);
      expect(data.gasket).toHaveProperty('@gasket/engine');
    });

    it('includes system data', async function () {
      const data = await metrics.collect();

      expect(data.system.platform).toEqual(os.platform());
      expect(data.system.release).toEqual(os.release());
      expect(data.system.arch).toEqual(os.arch());
    });

    it('includes gasket data', async function () {
      const data = await metrics.collect();

      expect(data.env).toEqual(mockGasket.config.env);
    });

    it('includes a timestamp', async function () {
      const { time } = await metrics.collect();
      expect(typeof time).toBe('number');
    });

    it('includes the gasket command', async function () {
      const { cmd } = await metrics.collect();
      expect(cmd).toEqual('test-command');
    });

    it('include the gasket dependencies in a list', async function () {
      const { deps } = await metrics.collect();
      expect(deps.length).toBeGreaterThan(2);
      expect(deps).toContain('@gasket/engine');
    });
  });

  describe('report', function () {
    let collectStub;

    beforeEach(() => {
      collectStub = jest.spyOn(Metrics.prototype, 'collect');
    });

    afterEach(() => {
      collectStub.mockClear();
    });

    it('Returns exactly what is collected', async function () {
      const data = { command: 'let\'s make this matzo' };
      collectStub.mockResolvedValue(data);
      const metricData = await metrics.report();

      expect(collectStub).toHaveBeenCalled();
      expect(metricData).toEqual(data);
    });

    it('does not collect if record disabled', async function () {
      mockGasket.command.flags.record = false;
      metrics = new Metrics(mockGasket);
      await metrics.report();

      expect(collectStub).not.toHaveBeenCalled();
    });
  });
});
