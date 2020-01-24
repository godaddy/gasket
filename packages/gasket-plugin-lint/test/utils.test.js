const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const {
  makeGatherDevDeps,
  makeRunScriptStr,
  makeSafeRunScript,
  eslintConfigIdentifier
} = require('../lib/utils');

describe('utils', () => {
  let context;

  afterEach(() => {
    sinon.resetHistory();
  });

  describe('makeGatherDevDeps', () => {
    let gatherDevDeps;

    beforeEach(() => {
      context = {
        pkgManager: {
          info: sinon.stub().callsFake(args => ({ data: args.includes('version') ? '1.2.3' : { bogus: '10.9.7' } }))
        }
      };

      gatherDevDeps = makeGatherDevDeps(context);
    });

    it('returns an async function', () => {
      assume(gatherDevDeps).is.a('asyncfunction');
    });

    it('gatherDevDeps looks up module version if not set', async () => {
      await gatherDevDeps('@some/module');
      assume(context.pkgManager.info).calledWith([sinon.match.any, 'version']);
    });

    it('gatherDevDeps uses parsed version', async () => {
      await gatherDevDeps('@some/module@^2.3.4');
      assume(context.pkgManager.info).not.calledWith([sinon.match.any, 'version']);
    });

    it('looks up peerDependencies of package at specific version', async () => {
      await gatherDevDeps('@some/module@^2.3.4');
      assume(context.pkgManager.info).calledWith(['@some/module@2.3.4', 'peerDependencies']);
    });

    it('returns object with dependencies including main package', async () => {
      const results = await gatherDevDeps('@some/module@^2.3.4');
      assume(results).eqls({
        '@some/module': '^2.3.4',
        'bogus': '10.9.7'
      });
    });
  });

  describe('makeRunScriptStr', () => {
    let forNpm, forYarn;
    beforeEach(() => {
      forNpm = makeRunScriptStr({ packageManager: 'npm' });
      forYarn = makeRunScriptStr({ packageManager: 'yarn' });
    });

    it('returns a function', () => {
      assume(forNpm).is.a('function');
      assume(forYarn).is.a('function');
    });

    it('[npm] returns run cmd', () => {
      const results = forNpm('bogus');
      assume(results).equals('npm run bogus');
    });

    it('[npm] returns run cmd with flags', () => {
      const results = forNpm('bogus -- --extra');
      assume(results).equals('npm run bogus -- --extra');
    });

    it('[yarn] returns cmd', () => {
      context = { packageManager: 'yarn' };
      const results = forYarn('bogus');
      assume(results).equals('yarn bogus');
    });

    it('[yarn] returns cmd with flags', () => {
      context = { packageManager: 'yarn' };
      const results = forYarn('bogus -- --extra');
      assume(results).equals('yarn bogus --extra');
    });

  });
  describe('makeSafeRunScript', () => {
    let safeRunScript, runScript;

    beforeEach(() => {
      runScript = sinon.stub();
      context = {
        warnings: [],
        pkg: {
          has: sinon.stub().callsFake((_, name) => name === 'existing')
        }
      };

      safeRunScript = makeSafeRunScript(context, runScript);
    });

    it('returns an async function', () => {
      assume(safeRunScript).is.a('asyncfunction');
    });

    it('checks if script exists', async () => {
      await safeRunScript('existing');
      assume(context.pkg.has).calledWith('scripts', 'existing');
    });

    it('runs script if it exists', async () => {
      await safeRunScript('existing');
      assume(runScript).calledWith('existing');
    });

    it('does not runs script if non existent', async () => {
      await safeRunScript('missing');
      assume(runScript).not.called();
    });

    it('adds warning if run error occurs', async () => {
      runScript.rejects('problem');
      await safeRunScript('existing');
      assume(runScript).called();
      assume(context.warnings).length(1);
    });

    it('no warnings if no problems', async () => {
      await safeRunScript('existing');
      assume(runScript).called();
      assume(context.warnings).length(0);
    });
  });

  describe('eslintConfigIdentifier', () => {
    it('does stuff', () => {
      const config = eslintConfigIdentifier('@scope');

      assume(config.longName).equals('@scope/eslint-config');
    });
  });
});
