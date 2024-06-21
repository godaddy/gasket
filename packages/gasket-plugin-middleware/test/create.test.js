const create = require('../lib/create');
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

  it('adds plugin to gasketConfig', () => {
    create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginMiddleware', name);
  });

  it('adds package dependency', () => {
    create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
