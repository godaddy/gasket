const plugin = require('../lib/index');
const { devDependencies } = require('../package');
const { name, version } = require('../package.json');

describe('Plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'create',
      'actions',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });
});

describe('create hook', () => {
  let mockContext;
  beforeEach(() => {

    mockContext = {
      pkg: {
        add: jest.fn(),
        has: jest.fn()
      },
      gasketConfig: { addPlugin: jest.fn() }
    };
  });

  it('adds itself to the dependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      webpack: devDependencies.webpack
    });
  });

  it('adds plugin import to the gasket file', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginWebpack', name);
  });
});
