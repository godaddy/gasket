/* eslint-disable jest/no-done-callback */
const path = require('path');

jest.mock('../../package.json', () => ({
  bin: {
    gasket: './bin/boot'
  }
}));

describe('local-cli', () => {
  const root = path.join(__dirname, '..', '..');
  const preboot = path.join(root, 'bin', 'boot');

  afterEach(() => {
    jest.resetModules();
  });

  it('uses preboot as bin file', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.bin.gasket).toEqual('./bin/boot');
  });

  it('requires the node_modules cli', (done) => {
    jest.doMock('@gasket/cli/bin/run', () => {
      setTimeout(() => {
        done();
      }, 0);
      return {};
    });

    require(preboot);
  });

  it('requires our own cli when no local-cli is found', (done) => {
    jest.doMock(path.join(root, 'bin', 'run'), () => {
      setTimeout(() => {
        done();
      }, 0);
      return {};
    });

    require(preboot);
  });
});
