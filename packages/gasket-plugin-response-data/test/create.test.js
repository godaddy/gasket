const plugin = require('../lib/plugin');

describe('create', function () {
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;

  beforeEach(function () {
    pkgHasStub = jest.fn().mockReturnValue(true);
    pkgAddStub = jest.fn();
    filesAddStub = jest.fn();

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      }
    };
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create({}, mockContext);
    expect(pkgAddStub.mock.calls[0]).toEqual(['dependencies', {
      '@gasket/data': require('../package.json').devDependencies['@gasket/data']
    }]);
  });
});
