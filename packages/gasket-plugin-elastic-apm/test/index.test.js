const apmGeneric = {
  start: jest.fn(),
  addFilter: jest.fn()
};

const mockAPM = {
  start: jest.fn().mockReturnValue(apmGeneric),
  addFilter: jest.fn().mockReturnValue(apmGeneric)
};

jest.mock('elastic-apm-node', () => mockAPM);
const apm = require('elastic-apm-node');
const plugin = require('../index');

describe('Plugin', () => {
  it('exposes a preboot lifecycle hook', () => {
    expect(typeof plugin.hooks).toStrictEqual('object');
    expect(typeof plugin.hooks.preboot).toStrictEqual('object');
    expect(typeof plugin.hooks.preboot.handler).toStrictEqual('function');
  });

  it('calls apm.start()', async () => {
    await plugin.hooks.preboot.handler({ config: { elasticAPM: { secretToken: 'abcd', serverUrl: 'https://example.com' } } });

    expect(apm.start).toHaveBeenCalledTimes(1);
    expect(apm.start).toHaveBeenCalledWith({ active: true, secretToken: 'abcd', serverUrl: 'https://example.com' });
  });

  it('disables the agent if one of serverUrl and secretToken are not defined', async () => {
    await plugin.hooks.preboot.handler({ config: {} });
    expect(apm.start).toHaveBeenCalledWith({ active: false });
  });
});
