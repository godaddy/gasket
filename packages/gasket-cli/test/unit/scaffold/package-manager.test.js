const proxyquire = require('proxyquire');
const assume = require('assume');
const sinon = require('sinon');

describe('packageManager', function () {
  const stdout = 'example output';
  let PackageManager;
  let runner;

  function manager(run) {
    return proxyquire('../../../src/scaffold/package-manager', {
      '../run-shell-command': run
    });
  }

  beforeEach(function () {
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

      it('calls install with the correct package manager', async function () {
        const pkg = new PackageManager({ packageManager });
        const res = await pkg.link();

        assume(runner.called).is.true();
        assume(runner.firstCall.args[0]).contains(packageManager);
        assume(runner.firstCall.args[1]).contains('link');

        assume(res).is.a('object');
        assume(res.stdout).equals(stdout);
      });
    });
  });
});
