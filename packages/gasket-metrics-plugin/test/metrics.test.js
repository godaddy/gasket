const assume = require('assume');
const sinon = require('sinon');
const path = require('path');
const os = require('os');
const Metrics = require('../lib/metrics');

const mockPackage = {
  name: 'mock-app',
  version: '7.8.9',
  dependencies: {
    '@gasket/plugin-engine': '1.2.3',
    '@gasket/example-plugin': '2.3.4',
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

      assume(data).is.a('object');
    });

    it('works in a directory without git', async function () {
      mockGasket.config.root = os.tmpdir();

      const parent = new Metrics(mockGasket);
      const data = await parent.collect();

      assume(data).is.a('object');
      assume(data.branch).is.a('undefined');
      assume(data.repository).is.a('undefined');
    });

    it('includes git data', async function () {
      const data = await metrics.collect();

      //
      // Note that the branch test is a bit vague, but for a reason. Can't
      // check if it's master, because when working on new features we create
      // new branches locally, which would cause this test to fail.
      //
      assume(data.branch).is.a('string');
      assume(data.repository).includes('gasket.git');
    });

    it('includes package from app metadata', async function () {
      const data = await metrics.collect();

      assume(data.name).equals(mockPackage.name);
      assume(data.version).equals(mockPackage.version);
      assume(data.gasket).owns('@gasket/plugin-engine');
    });

    it('includes system data', async function () {
      const data = await metrics.collect();

      assume(data.system.platform).equals(os.platform());
      assume(data.system.release).equals(os.release());
      assume(data.system.arch).equals(os.arch());
    });

    it('includes gasket data', async function () {
      const data = await metrics.collect();

      assume(data.env).equals(mockGasket.config.env);

      //
      // To confirm that we are not accidently including user paths to a
      // node.js binary.
      //
      assume(data.argv).contains('--require');
    });

    it('includes a timestamp', async function () {
      const { time } = await metrics.collect();
      assume(time).is.a('number');
    });

    it('includes the gasket command', async function () {
      const { cmd } = await metrics.collect();
      assume(cmd).equals('test-command');
    });

    it('include the gasket dependencies in a list', async function () {
      const { deps } = await metrics.collect();
      assume(deps).greaterThan(2);
      assume(deps).contains('@gasket/plugin-engine');
    });
  });

  describe('report', function () {
    let collectStub;

    beforeEach(() => {
      collectStub = sinon.stub(Metrics.prototype, 'collect');
    });

    afterEach(() => {
      collectStub.restore();
    });

    it('Returns exactly what is collected', async function () {
      const data = { command: 'let\'s make this matzo' };
      collectStub.resolves(data);
      const metricData = await metrics.report();

      assume(collectStub).called();
      assume(metricData).deep.equals(data);
    });

    it('does not collect if record disabled', async function () {
      mockGasket.command.flags.record = false;
      metrics = new Metrics(mockGasket);
      await metrics.report();

      assume(collectStub).not.called();
    });
  });
});
