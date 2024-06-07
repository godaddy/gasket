// eslint-disable-next-line no-unused-vars
const happyFeet = require('happy-feet');
const { name, version, description } = require('../package');

jest.mock('happy-feet', () => () => ({
  state: jest.fn(),
  STATE: { UNHAPPY: 'unhappy' }
}));


const plugin = require('../lib');

describe('Plugin', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('Returns error when happyfeet is sad', async () => {
    const gasket = { config: { get: jest.fn() } };
    await plugin.hooks.preboot(gasket);
    gasket.happyFeet.state = 'unhappy';
    await expect(plugin.hooks.healthcheck(gasket, Error)).rejects.toThrow('Happy Feet entered an unhappy state');
  });

  it('Returns page ok when happyfeet is fine', async () => {
    const gasket = { config: { get: jest.fn() } };
    await plugin.hooks.preboot(gasket);
    gasket.happyFeet.state = 'happy';
    const response = await plugin.hooks.healthcheck(gasket, Error);
    expect(response).toBeUndefined();
    // expect(response).toEqual('page ok');
  });
});
