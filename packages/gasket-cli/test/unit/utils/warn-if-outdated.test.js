const { runShellCommand } = require('@gasket/utils');
const chalk = require('chalk');
const { warnIfOutdated } = require('../../../lib/utils');

jest.mock('@gasket/utils', () => ({
  runShellCommand: jest.fn()
}));

describe('warnIfOutdated', function () {
  afterEach(function () {
    jest.clearAllMocks();
  });

  it('should log a warning if the package version is outdated', async function () {
    // Mock the npm view command result
    runShellCommand.mockResolvedValueOnce({ stdout: '1.2.0' });

    const pkgName = '@gasket/cli';
    const currentVersion = '1.1.0';

    // Capture console.warn output
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Call the function
    await warnIfOutdated(pkgName, currentVersion);

    // Verify that runShellCommand was called with the correct arguments
    expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});

    // Verify that the warning message was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      ` ${chalk.yellow('›')}   Warning: @gasket/cli update available from ${chalk.green('1.2.0')} to ${chalk.green('1.1.0')}`
    );
  });

  it('should not log a warning if the package version is up to date', async function () {
    // Mock the npm view command result
    runShellCommand.mockResolvedValueOnce({ stdout: '1.1.0' });

    const pkgName = '@gasket/cli';
    const currentVersion = '1.1.0';

    // Capture console.warn output
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Call the function
    await warnIfOutdated(pkgName, currentVersion);

    // Verify that runShellCommand was called with the correct arguments
    expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});

    // Verify that no warning message was logged
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should handle missing npm view result', async function () {
    // Mock an empty npm view command result
    runShellCommand.mockResolvedValueOnce({});

    const pkgName = '@gasket/cli';
    const currentVersion = '1.1.0';

    // Capture console.warn output
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Call the function
    await warnIfOutdated(pkgName, currentVersion);

    // Verify that runShellCommand was called with the correct arguments
    expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});

    // Verify that no warning message was logged
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
