const sinon = require('sinon');
const assume = require('assume');
const setup = require('../../../src/utils/setup');
require('../../fixtures/example-setup');

const resolvedFile = require.resolve('../../fixtures/example-setup.js', { paths: [__dirname] });
const resolvedPkg = require.resolve('mocha', { paths: [__dirname] });
delete require.cache[resolvedFile];
delete require.cache[resolvedPkg];

describe('cli setup', function () {
  beforeEach(function () {
    sinon.stub(process, 'cwd').callsFake(() => __dirname);
  });

  afterEach(function () {
    sinon.restore();
    delete require.cache[resolvedFile];
    delete require.cache[resolvedPkg];
  });

  it('requires correctly resolved file', function () {
    assume(require.cache).not.property(resolvedFile);
    setup(['/path/to/node', '/path/to/cli/bin', 'command', '--require', '../../fixtures/example-setup.js']);
    assume(require.cache).property(resolvedFile);
  });

  it('requires correctly resolved package', function () {
    assume(require.cache).not.property(resolvedPkg);
    setup(['/path/to/node', '/path/to/cli/bin', 'command', '--require', 'mocha']);
    assume(require.cache).property(resolvedPkg);
  });

  it('supports multiple flags', function () {
    assume(require.cache).not.property(resolvedFile);
    assume(require.cache).not.property(resolvedPkg);
    setup([
      '/path/to/node', '/path/to/cli/bin', 'command',
      '--require', '../../fixtures/example-setup.js',
      '--require', 'mocha'
    ]);
    assume(require.cache).property(resolvedFile);
    assume(require.cache).property(resolvedPkg);
  });
});
