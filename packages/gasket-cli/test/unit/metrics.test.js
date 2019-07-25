const assume = require('assume');
const path = require('path');
const os = require('os');
const Metrics = require('../../src/metrics');

describe('Metrics', function () {
  const gasket = {
    root: path.join(__dirname, '..', '..'),
    env: 'custom-env-set-here'
  };

  const metrics = new Metrics(gasket, true, 'start');

  describe('collect', function () {
    it('returns an object with', async function () {
      const data = await metrics.collect();

      assume(data).is.a('object');
    });

    it('works in a directory without git or package.json', async function () {
      const config = Object.assign({}, gasket);

      //
      // Major assumption ahead. We assume that the parent directory that
      // holds this repo has no package.json or git repo.
      //
      config.root = path.join(config.root, '..', '..', '..');

      const parent = new Metrics(config);
      const data = await parent.collect();

      assume(data).is.a('object');
      assume(data.branch).is.a('undefined');
      assume(data.repository).is.a('undefined');
      assume(data.name).is.a('undefined');
      assume(data.version).is.a('undefined');
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

    it('includes package.json data', async function () {
      const data = await metrics.collect();
      const pkg = require('../../package.json');

      assume(data.name).equals(pkg.name);
      assume(data.version).equals(pkg.version);
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

      assume(data.env).equals(gasket.env);

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
      assume(cmd).equals('start');
    });

    it('include the gasket dependencies in a list', async function () {
      const { deps } = await metrics.collect();
      assume(deps).has.length(2);
      assume(deps).contains('@gasket/plugin-engine');
    });
  });

  describe('report', function () {

    it('Returns exactly what is collected', async function () {
      const data = { command: 'let\'s make this matzo' };

      metrics.record = true;
      metrics.collect = async () => data;
      const metricData = await metrics.report(true);

      assume(metricData).deep.equals(data);
    });
  });
});
