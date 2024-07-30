const plugin = require('../');
const { name, version } = require('../package.json');

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn()
      },
      gasketConfig: {
        addPlugin: jest.fn()
      }
    };
  });

  it('add plugin to gasketConfig', () => {
    plugin.hooks.create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginMetadata', '@gasket/plugin-metadata');
  });

  it('add plugin to package.json dependencies', () => {
    plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
