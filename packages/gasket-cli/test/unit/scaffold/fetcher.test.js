const assume = require('assume');
const path = require('path');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { homedir } = require('os');

describe('fetcher', () => {
  let Fetcher;
  let ManagerStub;
  const stdout = 'example.tr.gz\nits all good';

  function makeFetcher(Manager) {
    return proxyquire('../../../src/scaffold/fetcher', {
      './package-manager': Manager
    });
  }

  beforeEach(() => {
    ManagerStub = {
      spawnNpm: sinon.stub().resolves({ stdout })
    };

    Fetcher = makeFetcher(ManagerStub);
  });

  describe('#fetch', function () {
    it('passes npmconfig to npm pack when defined', async () => {
      const npmconfig = path.join(homedir(), 'whatever', '.npmrc');
      const packageName = 'whatever';
      const fetcher = new Fetcher({
        npmconfig,
        packageName
      });

      await fetcher.fetch();
      assume(ManagerStub.spawnNpm.firstCall.args[0]).contains('--userconfig', npmconfig);
    });

    it('allows the cwd to be configured for package fetching', async () => {
      const fetcher = new Fetcher({});

      await fetcher.fetch('example', '/foo/bar');
      assume(ManagerStub.spawnNpm.firstCall.args[1].cwd).equals('/foo/bar');
    });
  });

  describe('#clone', function () {
    it('fetches the package into the tmp dir', async () => {
      const npmconfig = path.join(homedir(), 'whatever', '.npmrc');
      const packageName = 'whatever';
      const fetcher = new Fetcher({
        npmconfig,
        packageName
      });

      fetcher.unpack = sinon.stub().resolves('example');
      await fetcher.clone();

      assume(ManagerStub.spawnNpm.firstCall.args[1].cwd).includes(fetcher.tmp.dir);
    });
  });
});
