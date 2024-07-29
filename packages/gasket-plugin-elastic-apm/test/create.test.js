const create = require('../lib/create');
const { name, version, devDependencies } = require('../package.json');

describe('create lifecycle', function () {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn()
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

  it('adds the start script with --require', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      start: 'gasket start --require ./setup.js'
    });
  });

  it('adds the generator files', async () => {
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/\*$/));
  });
});
