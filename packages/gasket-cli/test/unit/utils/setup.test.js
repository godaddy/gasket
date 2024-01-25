const setup = require('../../../src/utils/setup');
require('../../fixtures/example-setup');

const resolvedFile = require.resolve('../../fixtures/example-setup.js', { paths: [__dirname] });
const resolvedPkg = require.resolve('jest', { paths: [__dirname] });
delete require.cache[resolvedFile];
delete require.cache[resolvedPkg];

describe('cli setup', function () {
  let spy;
  beforeEach(function () {
    spy = jest.spyOn(process, 'cwd').mockReturnValue(__dirname);
  });

  afterEach(function () {
    delete require.cache[resolvedFile];
    delete require.cache[resolvedPkg];
  });

  it('requires correctly resolved file', function () {
    expect(require.cache).not.toHaveProperty(resolvedFile);
    setup(['/path/to/node', '/path/to/cli/bin', 'command', '--require', '../../fixtures/example-setup.js']);
    expect(spy).toHaveBeenCalled();
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedFile]: expect.anything() }));
  });

  it('requires correctly resolved package', function () {
    expect(require.cache).not.toHaveProperty(resolvedPkg);
    setup(['/path/to/node', '/path/to/cli/bin', 'command', '--require', 'jest']);
    expect(spy).toHaveBeenCalled();
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedPkg]: expect.anything() }));
  });

  it('supports multiple flags', function () {
    expect(require.cache).not.toHaveProperty(resolvedFile);
    expect(require.cache).not.toHaveProperty(resolvedPkg);
    setup([
      '/path/to/node', '/path/to/cli/bin', 'command',
      '--require', '../../fixtures/example-setup.js',
      '--require', 'jest'
    ]);
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedFile]: expect.anything() }));
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedPkg]: expect.anything() }));
  });

  it('allows short -r flags', function () {
    expect(require.cache).not.toHaveProperty(resolvedFile);
    expect(require.cache).not.toHaveProperty(resolvedPkg);
    setup([
      '/path/to/node', '/path/to/cli/bin', 'command',
      '-r', '../../fixtures/example-setup.js',
      '-r', 'jest'
    ]);
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedFile]: expect.anything() }));
    expect(require.cache).toEqual(expect.objectContaining({ [resolvedPkg]: expect.anything() }));
  });
});
