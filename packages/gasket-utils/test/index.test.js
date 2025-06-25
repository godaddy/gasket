import { expect, describe, it } from 'vitest';
import * as utils from '../lib/index.js';

describe('index', () => {
  it('exposes expected function', () => {
    // List all expected functions
    const expected = [
      'applyConfigOverrides',
      'runShellCommand',
      'PackageManager',
      'warnIfOutdated',
      'getPackageLatestVersion'
    ];

    // Make sure all expected keys exist
    expect(expected.every(k => k in utils)).toBe(true);

    // Make sure the utils only exports what we expect
    const actualKeys = Object.keys(utils);
    expect(actualKeys.length).toEqual(expected.length);
  });
});
