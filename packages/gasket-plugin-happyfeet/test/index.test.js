// eslint-disable-next-line no-unused-vars
const { name, version, description } = require('../package');

const plugin = require('../lib');

describe('Plugin', () => {
  let mockGasket, mockError;
  beforeEach(() => {
    jest.restoreAllMocks();

    mockGasket = {
      config: { get: jest.fn() },
      actions: { getHappyFeet: jest.fn() }
    };

    mockError = jest.fn();
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('calls getHappyFeet action', async () => {
    await plugin.hooks.healthcheck(mockGasket, mockError);
    expect(mockGasket.actions.getHappyFeet).toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  it('Returns error when happyfeet is sad', async () => {
    mockGasket.actions.getHappyFeet.mockReturnValueOnce(({ state: 'unhappy', STATE: { UNHAPPY: 'unhappy' } }));
    await expect(plugin.hooks.healthcheck(mockGasket, Error)).rejects.toThrow('Happy Feet entered an unhappy state');
  });

  it('Returns page ok when happyfeet is fine', async () => {
    mockGasket.actions.getHappyFeet.mockReturnValueOnce(({ state: 'happy', STATE: { UNHAPPY: 'unhappy' } }));
    await plugin.hooks.healthcheck(mockGasket, mockError);
    expect(mockError).not.toHaveBeenCalled();
  });
});
