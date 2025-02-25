/* eslint-disable max-nested-callbacks */
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
  function createManager(run) {
    mockShellStub.mockImplementation(run);
    return require('../lib/package-manager');
  }

  beforeEach(function () {
    stdout = 'example output';
    runner = jest.fn().mockResolvedValueOnce({ stdout });
    PackageManager = createManager(runner);
  });

  describe('spawn commands', function () {
    ['npm', 'pnpm', 'yarn'].forEach((manager) => {
      it(`spawns ${manager} correctly`, async function () {
        const bin = process.platform === 'win32' ? `${manager}.cmd` : manager;
        const res = await PackageManager[`spawn${manager.charAt(0).toUpperCase() + manager.slice(1)}`](['install'], { cwd: '.' });
        expect(runner).toHaveBeenCalledWith(bin, expect.arrayContaining(['install']), expect.any(Object), expect.any(Boolean));
        expect(res).toEqual({ stdout });
      });
    });
  });

  describe('Instance methods', function () {
    ['npm', 'pnpm', 'yarn'].forEach((manager) => {
      describe(`[${manager}]`, function () {
        let pkg;

        beforeEach(() => {
          pkg = new PackageManager({ packageManager: manager, dest: '.' });
        });

        it('executes install correctly', async function () {
          await pkg.install();
          expect(runner).toHaveBeenCalledWith(
            expect.stringContaining(manager),
            expect.arrayContaining(['install']),
            expect.any(Object),
            expect.any(Boolean)
          );
        });

        if (manager === 'npm') {
          it('includes --legacy-peer-deps for npm', async function () {
            await pkg.install();
            expect(runner.mock.calls[0][1]).toContain('--legacy-peer-deps');
          });
        }

        it('executes link correctly', async function () {
          await pkg.link(['some-package']);
          expect(runner).toHaveBeenCalledWith(
            expect.stringContaining(manager),
            expect.arrayContaining(['link', 'some-package']),
            expect.any(Object),
            expect.any(Boolean)
          );
        });

        describe('info method', function () {
          beforeEach(() => {
            stdout = manager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
            runner = jest.fn().mockResolvedValueOnce({ stdout });
            PackageManager = createManager(runner);
            pkg = new PackageManager({ packageManager: manager, dest: '.' });
          });

          it('retrieves package info correctly', async function () {
            const res = await pkg.info();
            expect(runner).toHaveBeenCalledWith(
              expect.stringContaining(manager),
              expect.arrayContaining(['info', '--json']),
              expect.any(Object),
              expect.any(Boolean)
            );
            expect(res.stdout).toEqual(stdout);
            expect(res.data).toEqual('1.2.3');
          });
        });
      });
    });
  });
});
