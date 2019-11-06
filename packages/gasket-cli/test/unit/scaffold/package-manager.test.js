const proxyquire = require('proxyquire');
const assume = require('assume');
const sinon = require('sinon');

describe('packageManager', function () {
  let stdout;
  let PackageManager;
  let runner;

  function manager(run) {
    return proxyquire('../../../src/scaffold/package-manager', {
      '@gasket/utils': {
        runShellCommand: run
      }
    });
  }

  beforeEach(function () {
    stdout = 'example output';
    runner = sinon.stub().resolves({ stdout });
    PackageManager = manager(runner);
  });

  describe('.spawnYarn', function () {
    it('is a function', function () {
      assume(PackageManager.spawnYarn).is.a('function');
    });

    it('calls the yarn binary', async function () {
      const res = await PackageManager.spawnYarn(['install'], { cwd: '.' });

      assume(runner.called).is.true();
      assume(runner.firstCall.args[0]).contains('yarn');

      assume(res).is.a('object');
      assume(res.stdout).equals(stdout);
    });
  });

  describe('.spawnNpm', function () {
    it('is a function', function () {
      assume(PackageManager.spawnNpm).is.a('function');
    });

    it('calls the npm binary', async function () {
      const res = await PackageManager.spawnNpm(['install'], { cwd: '.' });

      assume(runner.called).is.true();
      assume(runner.firstCall.args[0]).contains('npm');

      assume(res).is.a('object');
      assume(res.stdout).equals(stdout);
    });
  });

  ['yarn', 'npm'].forEach(function each(packageManager) {
    describe(`[${packageManager}] install`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        assume(pkg.install).is.a('asyncfunction');
      });

      it('calls install with the correct package manager', async function () {
        const pkg = new PackageManager({ packageManager });
        const res = await pkg.install();

        assume(runner.called).is.true();
        assume(runner.firstCall.args[0]).contains(packageManager);
        assume(runner.firstCall.args[1]).contains('install');

        assume(res).is.a('object');
        assume(res.stdout).equals(stdout);
      });
    });

    describe(`[${packageManager}] link`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        assume(pkg.link).is.a('asyncfunction');
      });

      it('calls link with the correct package manager', async function () {
        const pkg = new PackageManager({ packageManager });
        const res = await pkg.link();

        assume(runner.called).is.true();
        assume(runner.firstCall.args[0]).contains(packageManager);
        assume(runner.firstCall.args[1]).contains('link');

        assume(res).is.a('object');
        assume(res.stdout).equals(stdout);
      });
    });

    describe(`[${packageManager}] info`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        assume(pkg.info).is.a('asyncfunction');
      });

      it('calls info with the correct package manager', async function () {
        stdout = '{}';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        await pkg.info();

        assume(runner.called).is.true();
        assume(runner.firstCall.args[0]).contains(packageManager);
        assume(runner.firstCall.args[1]).contains('info');
      });

      it('calls info with the --json flag', async function () {
        stdout = '{}';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        await pkg.info();

        assume(runner.called).is.true();
        assume(runner.firstCall.args[1]).contains('--json');
      });

      it('returns object with stdout and parsed data', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        assume(res).is.a('object');
        assume(res.stdout).equals(stdout);
        assume(res.data).equals('1.2.3');
      });

      it('returns data string', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        assume(res.data).is.a('string');
        assume(res.data).equals('1.2.3');
      });

      it('returns data object', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": { "something": "^3.4.5" } }' : '{ "something": "^3.4.5" }';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        assume(res.data).is.a('object');
        assume(res.data).eqls({ something: '^3.4.5' });
      });

      it('returns data array', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": ["maintainer <my@email.com>"] }' : '["maintainer <my@email.com>"]';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        assume(res.data).is.a('array');
        assume(res.data).eqls(['maintainer <my@email.com>']);
      });

      it('handles undefined data (or empty stdout)', async function () {
        stdout = packageManager === 'yarn' ? '{}' : '';
        runner = sinon.stub().resolves({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        assume(res.data).is.undefined();
      });
    });
  });
});
