// eslint-disable-next-line no-unused-vars
const happyFeet = require('happy-feet');
const { name, version, description } = require('../package');

jest.mock('happy-feet', () => () => ({
  state: jest.fn(),
  STATE: { UNHAPPY: 'unhappy' }
}));


const plugin = require('../lib');

describe('Plugin', () => {
  let healthCheck, mockGasket;
  beforeEach(() => {
    jest.restoreAllMocks();

    mockGasket = {
      config: { get: jest.fn() },
      actions: { getHappyFeet: jest.fn() }
    };
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('Returns error when happyfeet is sad', async () => {
    // gasket.happyFeet.state = 'unhappy';
    await expect(plugin.hooks.healthcheck(mockGasket, Error)).rejects.toThrow('Happy Feet entered an unhappy state');
  });

  it('Returns page ok when happyfeet is fine', async () => {
    await plugin.hooks.healthcheck(mockGasket, Error);
    // gasket.happyFeet.state = 'happy';
    const response = await plugin.hooks.healthcheck(mockGasket, Error);
    expect(response).toBeUndefined();
    // expect(response).toEqual('page ok');
  });
});
