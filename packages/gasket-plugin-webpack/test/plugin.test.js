const plugin = require('../lib/index');
const { devDependencies } = require('../package');

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
      }
    };
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      webpack: devDependencies.webpack
    });
  });
});
