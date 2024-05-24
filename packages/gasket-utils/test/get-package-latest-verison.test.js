/* eslint-disable no-control-regex */
const runShellCommand = require('../lib/run-shell-command');
const getPackageLatestVersion = require('../lib/get-package-latest-version');

const latestVersion = '1.1.1';
const pkgName = 'pkgName';

jest.mock('../lib/run-shell-command', () => jest.fn().mockResolvedValue({ stdout: latestVersion }));

describe('warnIfOutdated', function () {
  it('returns the latest version', async function () {
    const result = await getPackageLatestVersion(pkgName, {});

    expect(result).toEqual(latestVersion);
  });

  it('uses options when calling runShellCommand', async function () {
    const result = await getPackageLatestVersion(pkgName, { cwd: 'path' });

    expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], { cwd: 'path' });
    expect(result).toEqual(latestVersion);
  });
});
