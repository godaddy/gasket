/* eslint-disable no-control-regex */
import { expect, describe, it, vi } from 'vitest';

// Define constants
const pkgName = 'pkgName';
const latestVersion = '1.1.1';

// Create mock function
const mockRunShellCommand = vi.fn().mockResolvedValue({ stdout: latestVersion });

// Mock the modules - for ESM default exports, need to return an object with default property
vi.mock('../lib/run-shell-command.js', () => ({
  default: mockRunShellCommand
}));

// Import the module under test
const getPackageLatestVersion = (await import('../lib/get-package-latest-version.js')).default;

describe('getPackageLatestVersion', function () {
  it('returns the latest version', async function () {
    const result = await getPackageLatestVersion(pkgName, {});

    expect(result).toEqual(latestVersion);
  });

  it('uses options when calling runShellCommand', async function () {
    const result = await getPackageLatestVersion(pkgName, { cwd: 'path' });

    expect(mockRunShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], { cwd: 'path' });
    expect(result).toEqual(latestVersion);
  });
});
