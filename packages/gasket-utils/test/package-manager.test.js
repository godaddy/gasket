const mockShellStub = jest.fn();

jest.mock('../lib/run-shell-command', () => mockShellStub);

describe('packageManager', function () {
  let stdout;
  let PackageManager;
  let runner;

  /**
   * Create a package manager instance
   * @param {Function} run - run function
   * @returns {PackageManager} package manager instance
   */
  function manager(run) {
    mockShellStub.mockImplementation(run);
    return require('../lib/package-manager');
  }

  beforeEach(function () {
    stdout = 'example output';
    runner = jest.fn().mockResolvedValueOnce({ stdout });
    PackageManager = manager(runner);
  });

  describe('.spawnYarn', function () {
    it('is a function', function () {
      expect(typeof PackageManager.spawnYarn).toBe('function');
    });

    it('calls the yarn binary', async function () {
      const res = await PackageManager.spawnYarn(['install'], { cwd: '.' });

      expect(runner).toHaveBeenCalled();
      expect(runner.mock.calls[0][0]).toContain('yarn');

      expect(typeof res).toBe('object');
      expect(res.stdout).toEqual(stdout);
    });
  });

  describe('.spawnNpm', function () {
    it('is a function', function () {
      expect(typeof PackageManager.spawnNpm).toBe('function');
    });

    it('calls the npm binary', async function () {
      const res = await PackageManager.spawnNpm(['install'], { cwd: '.' });

      expect(runner).toHaveBeenCalled();
      expect(runner.mock.calls[0][0]).toContain('npm');

      expect(typeof res).toBe('object');
      expect(res.stdout).toEqual(stdout);
    });
  });

  describe('.spawnPnpm', function () {
    it('is a function', function () {
      expect(typeof PackageManager.spawnPnpm).toBe('function');
    });

    it('calls the pnpm binary', async function () {
      const res = await PackageManager.spawnPnpm(['install'], { cwd: '.' });

      expect(runner).toHaveBeenCalled();
      expect(runner.mock.calls[0][0]).toContain('pnpm');

      expect(typeof res).toBe('object');
      expect(res.stdout).toEqual(stdout);
    });
  });

  ['yarn', 'npm', 'pnpm'].forEach(function each(packageManager) {
    describe(`[${packageManager}] install`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        expect(typeof pkg.install).toBe('function');
      });

      it('calls install with the correct package manager', async function () {
        const pkg = new PackageManager({ packageManager });
        const res = await pkg.install();

        expect(runner).toHaveBeenCalled();
        expect(runner.mock.calls[0][0]).toContain(packageManager);
        expect(runner.mock.calls[0][1]).toContain('install');

        expect(typeof res).toBe('object');
        expect(res.stdout).toEqual(stdout);
      });

      it('toContain legacy-peer-deps flag', async function () {
        const pkg = new PackageManager('npm');
        await pkg.install();

        expect(runner.mock.calls[0][1]).toContain('--legacy-peer-deps');
      });
    });

    describe(`[${packageManager}] link`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        expect(typeof pkg.link).toBe('function');
      });

      it('calls link with the correct package manager', async function () {
        const pkg = new PackageManager({ packageManager });
        const res = await pkg.link();

        expect(runner).toHaveBeenCalled();
        expect(runner.mock.calls[0][0]).toContain(packageManager);
        expect(runner.mock.calls[0][1]).toContain('link');

        expect(typeof res).toBe('object');
        expect(res.stdout).toEqual(stdout);
      });
    });

    describe(`[${packageManager}] info`, function () {
      it('is a function', function () {
        const pkg = new PackageManager({ packageManager });

        expect(typeof pkg.info).toBe('function');
      });

      it('calls info with the correct package manager', async function () {
        stdout = '{}';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        await pkg.info();

        expect(runner).toHaveBeenCalled();
        expect(runner.mock.calls[0][0]).toContain(packageManager);
        expect(runner.mock.calls[0][1]).toContain('info');
      });

      it('calls info with the --json flag', async function () {
        stdout = '{}';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        await pkg.info();

        expect(runner).toHaveBeenCalled();
        expect(runner.mock.calls[0][1]).toContain('--json');
      });

      it('returns object with stdout and parsed data', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        expect(typeof res).toBe('object');
        expect(res.stdout).toEqual(stdout);
        expect(res.data).toEqual('1.2.3');
      });

      it('returns data string', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        expect(typeof res.data).toBe('string');
        expect(res.data).toEqual('1.2.3');
      });

      it('returns data object', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": { "something": "^3.4.5" } }' : '{ "something": "^3.4.5" }';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        expect(typeof res.data).toBe('object');
        expect(res.data).toEqual({ something: '^3.4.5' });
      });

      it('returns data array', async function () {
        stdout = packageManager === 'yarn' ? '{ "data": ["maintainer <my@email.com>"] }' : '["maintainer <my@email.com>"]';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data).toEqual(['maintainer <my@email.com>']);
      });

      it('handles undefined data (or empty stdout)', async function () {
        stdout = packageManager === 'yarn' ? '{}' : '';
        runner = jest.fn().mockResolvedValueOnce({ stdout });
        PackageManager = manager(runner);

        const pkg = new PackageManager({ packageManager });
        const res = await pkg.info();

        expect(res.data).toBeUndefined();
      });
    });
  });
});
