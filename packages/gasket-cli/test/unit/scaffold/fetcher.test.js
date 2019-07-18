const assume = require('assume');
const path = require('path');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { homedir } = require('os');

describe('fetcher', () => {
  let Fetcher;
  let ManagerStub;
  const stdout = 'what is happening man\nits all good';

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
});
