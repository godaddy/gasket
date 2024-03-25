/* eslint-disable no-sync,  no-control-regex */
const { runShellCommand } = require('@gasket/utils');
const { warnIfOutdated } = require('../../../lib/utils');
const fs = require('fs');

const currentTime = 1711147722892;
const eightDaysBeforeCurrentTime = 1710456522892;
const oneDayBeforeCurrentTime = 1711061322892;
const pkgName = '@gasket/cli';
const currentVersion = '1.1.0';
const latestVersion = '1.2.0';

function createCacheData(time, version) {
  return JSON.stringify({ latestVersionUpdateTime: time, latestVersion: version });
}

function stripAnsi(str) {
  // Regular expression to match ANSI escape codes
  const ansiRegex = /\u001b\[[0-9;]*m/g;

  // Replace ANSI escape codes with an empty string
  return str.replace(ansiRegex, '');
}

jest.mock('@gasket/utils', () => ({
  runShellCommand: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

describe('warnIfOutdated', function () {
  let consoleWarnSpy, consoleErrorSpy;
  beforeEach(function () {
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      getTime: () => currentTime
    }));
    consoleWarnSpy = jest.spyOn(console, 'warn');
    consoleErrorSpy = jest.spyOn(console, 'error');
  });

  afterEach(function () {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('no cache file', function () {
    beforeEach(function () {
      fs.existsSync.mockReturnValue(false);
    });

    it('logs a warning if outdated', async function () {
      runShellCommand.mockResolvedValueOnce({ stdout: latestVersion });

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
    });

    it('does not log a warning if not outdated', async function () {
      runShellCommand.mockResolvedValueOnce({ stdout: currentVersion });

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('log an error when there is an error fetching latest version', async function () {
      runShellCommand.mockRejectedValueOnce(new Error('new error'));

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching latest version:', new Error('new error'));
    });
  });

  describe('has cache file', function () {
    beforeEach(function () {
      fs.existsSync.mockReturnValue(true);
    });

    it('logs a warning if the cache version is outdated', async function () {
      fs.readFileSync.mockReturnValue(createCacheData(oneDayBeforeCurrentTime, latestVersion));

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
    });

    it('does not log a warning if the cache version is not outdated', async function () {
      fs.readFileSync.mockReturnValue(createCacheData(currentTime, currentVersion));

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('calls runShellCommand to get latest version if cache is update time is outdated', async function () {
      fs.readFileSync.mockReturnValue(createCacheData(eightDaysBeforeCurrentTime, latestVersion));
      runShellCommand.mockResolvedValueOnce({ stdout: latestVersion });

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});
    });

    it('calls runShellCommand to get latest version if cache update time is falsy', async function () {
      fs.readFileSync.mockReturnValue(createCacheData(null, latestVersion));
      runShellCommand.mockResolvedValueOnce({ stdout: latestVersion });

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});
    });

    it('calls runShellCommand to get latest version if cache version is falsy', async function () {
      fs.readFileSync.mockReturnValue(createCacheData(oneDayBeforeCurrentTime, null));
      runShellCommand.mockResolvedValueOnce({ stdout: latestVersion });

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(runShellCommand).toHaveBeenCalledWith('npm', ['view', pkgName, 'version'], {});
    });

    it('logs an error when reading the cache file', async function () {
      fs.readFileSync.mockImplementation(() => { throw new Error('new error'); });
      runShellCommand.mockResolvedValueOnce({ stdout: latestVersion });

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading cache file:', new Error('new error'));
      expect(strippedAnsiWarnLog.includes('@gasket/cli update available from 1.2.0 to 1.1.0')).toBe(true);
    });
  });
});
