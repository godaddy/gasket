/* eslint-disable max-nested-callbacks */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies first
const mockRunShellCommand = vi.fn();

// For ESM default exports, need to return an object with default property
vi.mock('../lib/run-shell-command.js', () => ({
  default: mockRunShellCommand
}));

// Import the module
const PackageManager = (await import('../lib/package-manager.js')).default;

describe('packageManager', function () {
  let stdout;
  let runner;

  // Before each test setup
  beforeEach(() => {
    // Setup test data
    stdout = 'example output';
    runner = vi.fn().mockResolvedValue({ stdout });
    mockRunShellCommand.mockImplementation(runner);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('spawn commands', function () {
    ['npm', 'pnpm', 'yarn'].forEach((manager) => {
      it(`spawns ${manager} correctly`, async function () {
        const bin = process.platform === 'win32' ? `${manager}.cmd` : manager;
        const res = await PackageManager[`spawn${manager.charAt(0).toUpperCase() + manager.slice(1)}`](['install'], { cwd: '.' });
        expect(runner).toHaveBeenCalledWith(bin, expect.arrayContaining(['install']), expect.any(Object), expect.any(Boolean));
        expect(res).toEqual({ stdout });
      }, 10000);
    });
  });

  describe('Instance methods', function () {
    ['npm', 'pnpm', 'yarn'].forEach((manager) => {
      describe(`[${manager}]`, function () {
        let pkg;

        beforeEach(() => {
          // Create a new instance for each test
          pkg = new PackageManager({ packageManager: manager, dest: '.' });

          // Set up the mock response for each test
          runner.mockResolvedValue({ stdout });
        });

        it('executes install correctly', async function () {
          await pkg.install();
          expect(runner).toHaveBeenCalledWith(
            expect.stringContaining(manager),
            expect.arrayContaining(['install']),
            expect.any(Object),
            expect.any(Boolean)
          );
        }, 10000);

        if (manager === 'npm') {
          it('includes --legacy-peer-deps for npm', async function () {
            await pkg.install();
            expect(runner.mock.calls[0][1]).toContain('--legacy-peer-deps');
          }, 10000);
        }

        it('executes link correctly', async function () {
          await pkg.link(['some-package']);
          expect(runner).toHaveBeenCalledWith(
            expect.stringContaining(manager),
            expect.arrayContaining(['link', 'some-package']),
            expect.any(Object),
            expect.any(Boolean)
          );
        }, 10000);

        describe('info method', function () {
          beforeEach(() => {
            // Set up specialized output for info tests
            const infoStdout = manager === 'yarn' ? '{ "data": "1.2.3" }' : '"1.2.3"';
            runner.mockResolvedValue({ stdout: infoStdout });
          });

          it('retrieves package info correctly', async function () {
            const res = await pkg.info();
            expect(runner).toHaveBeenCalledWith(
              expect.stringContaining(manager),
              expect.arrayContaining(['info', '--json']),
              expect.any(Object),
              expect.any(Boolean)
            );
            // For yarn the output is JSON, for npm it's a string
            const expectedData = '1.2.3';
            expect(res.data).toEqual(expectedData);
          }, 10000);
        });
      });
    });
  });
});
