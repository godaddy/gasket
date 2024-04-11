const mockConstructorStub = jest.fn();

const path = require('path');
const defaultPlugins = require('../../../lib/config/default-plugins');

jest.mock('@gasket/engine', () => {
  return class GasketEngine {
    constructor() {
      mockConstructorStub(...arguments);
    }
    async exec() {}
  };
});

const createEngine = require('../../../lib/scaffold/create-engine');

describe('createEngine', () => {
  let mockOpts;

  beforeEach(() => {
    mockOpts = {
      dest: '/some/path/my-app',
      presets: ['bogus-preset'],
      plugins: ['bogus-A-plugin', 'bogus-B-plugin']
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('instantiates GasketEngine with preset from context in array', async () => {
    await createEngine(mockOpts);
    expect(mockConstructorStub).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.objectContaining({ presets: ['bogus-preset'] })
      }),
      { resolveFrom: path.join(mockOpts.dest, 'node_modules') }
    );
  });

  it('instantiates GasketEngine if no preset in context', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createEngine(mockOpts);
    expect(mockConstructorStub).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.objectContaining({ presets: [] })
      }),
      { resolveFrom: path.join(mockOpts.dest, 'node_modules') }
    );
  });

  it('instantiates GasketEngine with built-in git-plugin', async () => {
    await createEngine(mockOpts);
    expect(mockConstructorStub).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.objectContaining({
          add: [...defaultPlugins, 'bogus-A-plugin', 'bogus-B-plugin']
        })
      }),
      { resolveFrom: path.join(mockOpts.dest, 'node_modules') }
    );
  });

  it('instantiates GasketEngine with plugins from context', async () => {
    await createEngine(mockOpts);
    expect(mockConstructorStub).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.objectContaining({
          add: [...defaultPlugins, 'bogus-A-plugin', 'bogus-B-plugin']
        })
      }),
      { resolveFrom: path.join(mockOpts.dest, 'node_modules') }
    );
  });

  it('instantiates GasketEngine if no plugins in context', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createEngine(mockOpts);
    expect(mockConstructorStub).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.objectContaining({
          add: defaultPlugins
        })
      }),
      { resolveFrom: path.join(mockOpts.dest, 'node_modules') }
    );
  });

  it('instantiates GasketEngine with resolveFrom options', async () => {
    mockOpts = {
      dest: '/some/path/my-app'
    };

    await createEngine(mockOpts);
    expect(mockConstructorStub)
      .toHaveBeenCalledWith(expect.anything(), { resolveFrom: path.join(mockOpts.dest, 'node_modules') });
  });
});
