const path = require('path');
const main = require('../lib/main');

jest.mock('child_process', () => ({
  fork: jest.fn()
}));

const { fork } = require('child_process');

describe('create-gasket-app', function () {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls the @gasket/cli bin from node_modules', function () {
    main();
    expect(fork.mock.calls[0][0]).toContain(path.join('gasket-cli', 'bin', 'run'));
  });

  it('passes the create arg', function () {
    main();
    expect(fork.mock.calls[0][1]).toEqual(['create']);
  });

  it('passes through additional arguments', function () {
    main('-p', '@gasket/preset-nextjs');
    expect(fork.mock.calls[0][1]).toEqual(['create', '-p', '@gasket/preset-nextjs']);
  });
});
