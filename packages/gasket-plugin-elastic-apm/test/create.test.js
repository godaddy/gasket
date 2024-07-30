const create = require('../lib/create');
const { name, version, devDependencies } = require('../package.json');

describe('create lifecycle', function () {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn(),
        extend: jest.fn().mockImplementation((fn) => fn({ scripts: { start: 'node server.js' } }))
      },
      files: {
        add: jest.fn()
      },
      gasketConfig: {
        addPlugin: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is a function', () => {
    expect(typeof create).toStrictEqual('function');
  });

  it('adds the plugin to the gasket config', async () => {
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginElasticApm', name);
  });

  it('adds expected dependencies', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`,
      'dotenv': devDependencies.dotenv,
      'elastic-apm-node': devDependencies['elastic-apm-node']
    });
  });

  it('adds the start script with --import', async () => {
    const result = mockContext.pkg.extend((current) => {
      return {
        scripts: {
          start: `node --import ./setup.js & ${current.scripts.start}`
        }
      };
    });
    await create({}, mockContext);
    expect(mockContext.pkg.extend).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toEqual({ scripts: { start: 'node --import ./setup.js & node server.js' } });
  });

  it('adds the generator files', async () => {
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/\*$/));
  });
});
