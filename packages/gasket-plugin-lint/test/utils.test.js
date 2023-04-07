const {
  makeGatherDevDeps,
  makeRunScriptStr,
  makeSafeRunScript,
  eslintConfigIdentifier
} = require('../lib/utils');

describe('utils', () => {
  let context;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeGatherDevDeps', () => {
    let gatherDevDeps;

    beforeEach(() => {
      context = {
        pkgManager: {
          info: jest.fn().mockImplementation(args => ({ data: args.includes('version') ? '1.2.3' : { bogus: '10.9.7' } }))
        }
      };

      gatherDevDeps = makeGatherDevDeps(context);
    });

    it('returns an async function', () => {
      expect(typeof gatherDevDeps).toBe('function');
    });

    it('gatherDevDeps looks up module version if not set', async () => {
      await gatherDevDeps('@some/module');
      expect(context.pkgManager.info).toHaveBeenCalledWith([expect.any(String), 'version']);
    });

    it('gatherDevDeps uses parsed version', async () => {
      await gatherDevDeps('@some/module@^2.3.4');
      expect(context.pkgManager.info).not.toHaveBeenCalledWith([expect.any(String), 'version']);
    });

    it('looks up peerDependencies of package at specific version', async () => {
      await gatherDevDeps('@some/module@^2.3.4');
      expect(context.pkgManager.info).toHaveBeenCalledWith(['@some/module@2.3.4', 'peerDependencies']);
    });

    it('returns object with dependencies including main package', async () => {
      const results = await gatherDevDeps('@some/module@^2.3.4');
      expect(results).toEqual({
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
      expect(typeof forNpm).toBe('function');
      expect(typeof forYarn).toBe('function');
    });

    it('[npm] returns run cmd', () => {
      const results = forNpm('bogus');
      expect(results).toEqual('npm run bogus');
    });

    it('[npm] returns run cmd with flags', () => {
      const results = forNpm('bogus -- --extra');
      expect(results).toEqual('npm run bogus -- --extra');
    });

    it('[yarn] returns cmd', () => {
      context = { packageManager: 'yarn' };
      const results = forYarn('bogus');
      expect(results).toEqual('yarn bogus');
    });

    it('[yarn] returns cmd with flags', () => {
      context = { packageManager: 'yarn' };
      const results = forYarn('bogus -- --extra');
      expect(results).toEqual('yarn bogus --extra');
    });

  });
  describe('makeSafeRunScript', () => {
    let safeRunScript, runScript;

    beforeEach(() => {
      runScript = jest.fn();
      context = {
        warnings: [],
        pkg: {
          has: jest.fn().mockImplementation((_, name) => name === 'existing')
        }
      };

      safeRunScript = makeSafeRunScript(context, runScript);
    });

    it('returns an async function', () => {
      expect(typeof safeRunScript).toBe('function');
    });

    it('checks if script exists', async () => {
      await safeRunScript('existing');
      expect(context.pkg.has).toHaveBeenCalledWith('scripts', 'existing');
    });

    it('runs script if it exists', async () => {
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalledWith('existing');
    });

    it('does not runs script if non existent', async () => {
      await safeRunScript('missing');
      expect(runScript).not.toHaveBeenCalled();
    });

    it('adds warning if run error occurs', async () => {
      runScript.mockRejectedValue('problem');
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalled();
      expect(context.warnings).toHaveLength(1);
    });

    it('no warnings if no problems', async () => {
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalled();
      expect(context.warnings).toHaveLength(0);
    });
  });

  describe('eslintConfigIdentifier', () => {
    it('does stuff', () => {
      const config = eslintConfigIdentifier('@scope');

      expect(config.longName).toEqual('@scope/eslint-config');
    });
  });
});
