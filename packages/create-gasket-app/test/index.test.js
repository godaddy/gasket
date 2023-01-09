const path = require('path');

const mockForkStub = jest.fn();
const mockExecute = (...args) => {
  process.argv = ['node', 'bin', ...args];
  return mockForkStub(
    path.join(__dirname, '..', 'node_modules', '.bin', 'gasket'),
    ['create', ...args],
    { stdio: 'inherit', stdin: 'inherit', stderr: 'inherit' }
  );
};

describe('create-gasket-app', function () {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls the @gasket/cli bin from node_modules', function () {
    mockExecute();
    expect(mockForkStub.mock.calls[0][0]).toContain(path.join('node_modules', '.bin', 'gasket'));
  });

  it('passes the create arg', function () {
    mockExecute();
    expect(mockForkStub.mock.calls[0][1]).toEqual(['create']);
  });

  it('passes through additional arguments', function () {
    mockExecute('-p', '@gasket/preset-nextjs');
    expect(mockForkStub.mock.calls[0][1]).toEqual(['create', '-p', '@gasket/preset-nextjs']);
  });
});
