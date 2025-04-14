const { name, version } = require('../package.json');
const create = require('../lib/create');

describe('create', () => {
  let mockCreateContext;

  beforeEach(() => {
    mockCreateContext = {
      pkg: {
        add: jest.fn()
      },
      gasketConfig: {
        addPlugin: jest.fn()
      }
    };
  });

  it('adds plugin to gasketConfig', async () => {
    await create({}, mockCreateContext);

    expect(mockCreateContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginHttps', name);
  });

  it('adds plugin to package.json dependencies', async () => {
    await create({}, mockCreateContext);

    expect(mockCreateContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
