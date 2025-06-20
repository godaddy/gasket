/* eslint-disable no-control-regex */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

// Define constants
const currentTime = 1711147722892;
const eightDaysBeforeCurrentTime = 1710456522892;
const oneDayBeforeCurrentTime = 1711061322892;
const pkgName = '@gasket/core';
const currentVersion = '1.1.0';
const latestVersion = '1.2.0';

// Mock functions
const mockGetPackageLatestVersion = vi.fn();
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();

// Create helper functions
function createCacheData(time, version) {
  return JSON.stringify({ latestVersionUpdateTime: time, latestVersion: version });
}

function stripAnsi(str) {
  // Regular expression to match ANSI escape codes
  const ansiRegex = /\u001b\[[0-9;]*m/g;

  // Replace ANSI escape codes with an empty string
  return str.replace(ansiRegex, '');
}

// Setup mocks for ESM default exports
vi.mock('../lib/get-package-latest-version.js', () => ({
  default: mockGetPackageLatestVersion
}));

vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile
}));

// Import the module under test directly for CommonJS modules
// const warnIfOutdated = require('../lib/warn-if-outdated');
const warnIfOutdated = (await import('../lib/warn-if-outdated.js')).default;

// Setup before each test
beforeEach(() => {
  // Reset mocks
  mockGetPackageLatestVersion.mockReset();
  mockReadFile.mockReset();
  mockWriteFile.mockReset();
});

describe('warnIfOutdated', function () {
  let consoleWarnSpy, consoleErrorSpy;
  beforeEach(function () {
    vi.spyOn(global, 'Date').mockImplementation(() => ({
      getTime: () => currentTime
    }));
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('no cache file', function () {
    it('logs a warning if outdated', async function () {
      mockGetPackageLatestVersion.mockResolvedValueOnce(latestVersion);

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/core update available')).toBe(true);
    });

    it('does not log a warning if not outdated', async function () {
      mockGetPackageLatestVersion.mockResolvedValueOnce(currentVersion);

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('log an error when there is an error fetching latest version', async function () {
      mockGetPackageLatestVersion.mockRejectedValueOnce(new Error('new error'));

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching latest version:', new Error('new error'));
    });
  });

  describe('has cache file', function () {
    it('logs a warning if the cache version is outdated', async function () {
      mockReadFile.mockResolvedValueOnce(createCacheData(oneDayBeforeCurrentTime, latestVersion));

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/core update available from 1.2.0 to 1.1.0')).toBe(true);
    });

    it('does not log a warning if the cache version is not outdated', async function () {
      mockReadFile.mockResolvedValueOnce(createCacheData(currentTime, currentVersion));

      await warnIfOutdated(pkgName, currentVersion);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('calls getPackageLatestVersion to get latest version if cache is update time is outdated', async function () {
      mockReadFile.mockResolvedValueOnce(createCacheData(eightDaysBeforeCurrentTime, latestVersion));
      mockGetPackageLatestVersion.mockResolvedValueOnce(latestVersion);

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/core update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(mockGetPackageLatestVersion).toHaveBeenCalledWith(pkgName, {});
    });

    it('calls getPackageLatestVersion to get latest version if cache update time is falsy', async function () {
      mockReadFile.mockResolvedValueOnce(createCacheData(null, latestVersion));
      mockGetPackageLatestVersion.mockResolvedValueOnce(latestVersion);

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/core update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(mockGetPackageLatestVersion).toHaveBeenCalledWith(pkgName, {});
    });

    it('calls getPackageLatestVersion to get latest version if cache version is falsy', async function () {
      mockReadFile.mockResolvedValueOnce(createCacheData(oneDayBeforeCurrentTime, null));
      mockGetPackageLatestVersion.mockResolvedValueOnce(latestVersion);

      await warnIfOutdated(pkgName, currentVersion);
      const strippedAnsiWarnLog = stripAnsi(consoleWarnSpy.mock.calls[0][0]);

      expect(strippedAnsiWarnLog.includes('@gasket/core update available from 1.2.0 to 1.1.0')).toBe(true);
      expect(mockGetPackageLatestVersion).toHaveBeenCalledWith(pkgName, {});
    });
  });
});
