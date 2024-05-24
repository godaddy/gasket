const path = require('path');
const { devDependencies } = require('../package');

describe('create hook', () => {
  let mockContext;
  const plugin = require('../lib/');
  const root = path.join(__dirname, '..', 'lib');
  const generatorDir = `${root}/../generator`;

  beforeEach(() => {
    mockContext = {
      useRedux: true,
      pkg: {
        add: jest.fn(),
        has: jest.fn()
      },
      files: { add: jest.fn() },
      gasketConfig: {
        add: jest.fn(),
        addPlugin: jest.fn()
      }
    };
  });

  it('adds the appropriate globs', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${generatorDir}/*`, `${generatorDir}/**/*`
    );
  });

  it('adds expected dependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        '@gasket/redux': devDependencies['@gasket/redux'],
        'react-redux': devDependencies['react-redux'],
        'redux': devDependencies.redux
      })
    );
  });

  it('does not add redux dependencies if useRedux is false', async function () {
    mockContext.useRedux = false;
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).not.toHaveBeenCalled();
  });
});
