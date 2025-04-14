const {
  makeGatherDevDeps,
  makeRunScriptStr,
  makeSafeRunScript
} = require('../lib/utils');

describe('utils', () => {
  let context;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeGatherDevDeps', () => {
    let gatherDevDeps;

    beforeEach(() => {
      gatherDevDeps = makeGatherDevDeps();
    });

    it('returns a function', () => {
      expect(typeof gatherDevDeps).toBe('function');
    });

    it('gatherDevDeps returns hardcoded version', () => {
      const results = gatherDevDeps('eslint-config-airbnb');
      expect(results).toEqual({
        'eslint-config-airbnb': '^19.0.4',
        'eslint': '^8.57.1',
        'eslint-plugin-import': '^2.27.5',
        'eslint-plugin-jsx-a11y': '^6.6.1',
        'eslint-plugin-react': '^7.32.2',
        'eslint-plugin-react-hooks': '^4.6.0'
      });
    });

    it('throws TypeError for an invalid package name', () => {
      expect(() => gatherDevDeps('')).toThrow(TypeError);
      expect(() => gatherDevDeps(123)).toThrow(TypeError);
      expect(() => gatherDevDeps(null)).toThrow(TypeError);
    });

    it('throws ReferenceError for an unknown package', () => {
      expect(() => gatherDevDeps('unknown-package')).toThrow(ReferenceError);
    });
  });

  describe('makeRunScriptStr', () => {
    let forNpm, forYarn, forPnpm;

    beforeEach(() => {
      forNpm = makeRunScriptStr({ packageManager: 'npm' });
      forPnpm = makeRunScriptStr({ packageManager: 'pnpm' });
      forYarn = makeRunScriptStr({ packageManager: 'yarn' });
    });

    it('returns a function', () => {
      expect(typeof forNpm).toBe('function');
      expect(typeof forPnpm).toBe('function');
      expect(typeof forYarn).toBe('function');
    });

    it('[npm] returns run command', () => {
      const results = forNpm('test-script');
      expect(results).toEqual('npm run test-script');
    });

    it('[npm] returns run command with flags', () => {
      const results = forNpm('test-script -- --extra');
      expect(results).toEqual('npm run test-script -- --extra');
    });

    it('[yarn] returns command', () => {
      const results = forYarn('test-script');
      expect(results).toEqual('yarn run test-script');
    });

    it('[yarn] returns command with flags (removes "--")', () => {
      const results = forYarn('test-script -- --extra');
      expect(results).toEqual('yarn run test-script --extra');
    });

    it('[pnpm] returns command', () => {
      const results = forPnpm('test-script');
      expect(results).toEqual('pnpm run test-script');
    });

    it('[pnpm] returns command with flags (removes "--")', () => {
      const results = forPnpm('test-script -- --extra');
      expect(results).toEqual('pnpm run test-script --extra');
    });

    it('throws TypeError for an invalid script name', () => {
      expect(() => forNpm('')).toThrow(TypeError);
      expect(() => forNpm(123)).toThrow(TypeError);
      expect(() => forYarn(null)).toThrow(TypeError);
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

    it('returns a function', () => {
      expect(typeof safeRunScript).toBe('function');
    });

    it('checks if script exists before running', async () => {
      await safeRunScript('existing');
      expect(context.pkg.has).toHaveBeenCalledWith('scripts', 'existing');
    });

    it('executes script if it exists', async () => {
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalledWith('existing');
    });

    it('does not execute script if it does not exist', async () => {
      await safeRunScript('missing');
      expect(runScript).not.toHaveBeenCalled();
    });

    it('adds warning if script execution fails', async () => {
      runScript.mockRejectedValue(new Error('Script execution failed'));
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalled();
      expect(context.warnings).toContainEqual(
        "Errors encountered running script: 'existing'"
      );
    });

    it('does not add warnings if script runs successfully', async () => {
      await safeRunScript('existing');
      expect(runScript).toHaveBeenCalled();
      expect(context.warnings).toHaveLength(0);
    });

    it('throws TypeError for an invalid script name', async () => {
      await expect(safeRunScript('')).rejects.toThrow(TypeError);
      await expect(safeRunScript(123)).rejects.toThrow(TypeError);
      await expect(safeRunScript(null)).rejects.toThrow(TypeError);
    });
  });
});
