import { jest } from '@jest/globals';
import path from 'path';

const mockFork = jest.fn();

jest.unstable_mockModule('child_process', () => ({
  fork: mockFork
}));

const main = (await import('../lib/main.js')).default;

describe('create-gasket-app', function () {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls the @gasket/cli bin from node_modules', function () {
    main();
    expect(mockFork.mock.calls[0][0]).toContain(path.join('gasket-cli', 'bin', 'run'));
  });

  it('passes the create arg', function () {
    main();
    expect(mockFork.mock.calls[0][1]).toEqual(['create']);
  });

  it('passes through additional arguments', function () {
    main('-p', '@gasket/preset-nextjs');
    expect(mockFork.mock.calls[0][1]).toEqual(['create', '-p', '@gasket/preset-nextjs']);
  });
});
